-- Fitwinz store schema: catalog, customers, orders, settings, admin.
-- Row Level Security is enabled on every table. Anonymous visitors can only read the
-- public catalog and store settings; orders are created exclusively through
-- place_order(), which is callable only with the server-side secret key.

-- ---------------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------------
create type public.order_status as enum ('pending', 'confirmed', 'shipped', 'delivered', 'returned', 'cancelled');
create type public.discount_type as enum ('percent', 'fixed');

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Store settings (single row)
-- ---------------------------------------------------------------------------
create table public.store_settings (
  id smallint primary key default 1 check (id = 1),
  currency_code text not null default 'USD' check (currency_code ~ '^[A-Z]{3}$'),
  currency_prefix text not null default 'US$' check (char_length(currency_prefix) between 1 and 8),
  shipping_fee numeric(10, 2) not null default 15 check (shipping_fee >= 0),
  -- null = no free-shipping offer
  free_shipping_threshold numeric(10, 2) default 100 check (free_shipping_threshold is null or free_shipping_threshold > 0),
  updated_at timestamptz not null default now()
);

insert into public.store_settings (id, currency_code, currency_prefix, shipping_fee, free_shipping_threshold)
values (1, 'USD', 'US$', 15, 100);

create trigger store_settings_updated_at before update on public.store_settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Admins
-- ---------------------------------------------------------------------------
create table public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admin_users a where a.user_id = auth.uid());
$$;

-- ---------------------------------------------------------------------------
-- Catalog
-- ---------------------------------------------------------------------------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  category_id uuid references public.categories (id) on delete set null,
  name text not null check (char_length(name) between 1 and 120),
  fit text not null default '',
  color text not null default '',
  description text,
  price numeric(10, 2) not null check (price >= 0),
  rating numeric(2, 1) check (rating is null or rating between 0 and 5),
  is_new boolean not null default false,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_category_idx on public.products (category_id, sort_order);

create trigger products_updated_at before update on public.products
  for each row execute function public.set_updated_at();

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  size text not null check (char_length(size) between 1 and 12),
  color text,
  sku text not null unique,
  stock int not null default 0 check (stock >= 0),
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, size)
);

create trigger product_variants_updated_at before update on public.product_variants
  for each row execute function public.set_updated_at();

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  -- Site-relative path ("/images/x.webp") or a public Storage URL.
  url text not null,
  -- Set when the file lives in the product-images Storage bucket.
  storage_path text,
  alt text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index product_images_product_idx on public.product_images (product_id, sort_order);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  customer_id uuid,
  author_name text not null,
  rating int not null check (rating between 1 and 5),
  title text,
  body text,
  is_approved boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Customers & orders
-- ---------------------------------------------------------------------------
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users (id) on delete set null,
  full_name text not null,
  phone text not null unique check (phone ~ '^\+212[5-7][0-9]{8}$'),
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger customers_updated_at before update on public.customers
  for each row execute function public.set_updated_at();

alter table public.reviews
  add constraint reviews_customer_fk foreign key (customer_id) references public.customers (id) on delete set null;

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete cascade,
  city text not null,
  address_line text not null,
  created_at timestamptz not null default now()
);

create table public.discount_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code = upper(code) and code ~ '^[A-Z0-9_-]{3,32}$'),
  type public.discount_type not null,
  value numeric(10, 2) not null check (value > 0),
  min_subtotal numeric(10, 2) not null default 0 check (min_subtotal >= 0),
  starts_at timestamptz,
  ends_at timestamptz,
  max_uses int check (max_uses is null or max_uses > 0),
  used_count int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  check (type <> 'percent' or value <= 100)
);

create sequence public.order_number_seq start 1001;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('FW-' || nextval('public.order_number_seq')::text),
  -- Unguessable id used in the customer's confirmation link.
  public_token uuid not null unique default gen_random_uuid(),
  customer_id uuid references public.customers (id) on delete set null,
  address_id uuid references public.addresses (id) on delete set null,
  status public.order_status not null default 'pending',
  -- Snapshot of the delivery details at order time.
  full_name text not null,
  phone text not null,
  email text,
  city text not null,
  address_line text not null,
  notes text,
  payment_method text not null default 'cod' check (payment_method = 'cod'),
  currency_code text not null,
  subtotal numeric(10, 2) not null,
  discount_code text,
  discount_amount numeric(10, 2) not null default 0,
  shipping_fee numeric(10, 2) not null,
  total numeric(10, 2) not null,
  -- True once stock has been returned (cancelled/returned); prevents double restocking.
  restocked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_status_created_idx on public.orders (status, created_at desc);
create index orders_created_idx on public.orders (created_at desc);

create trigger orders_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  variant_id uuid references public.product_variants (id) on delete set null,
  -- Price and product snapshot at order time.
  product_slug text not null,
  product_name text not null,
  color text,
  size text not null,
  sku text,
  image_url text,
  unit_price numeric(10, 2) not null,
  quantity int not null check (quantity > 0),
  line_total numeric(10, 2) not null
);
create index order_items_order_idx on public.order_items (order_id);

create table public.shipments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders (id) on delete cascade,
  carrier text,
  tracking_number text,
  shipped_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger shipments_updated_at before update on public.shipments
  for each row execute function public.set_updated_at();

create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email = lower(email)),
  source text not null default 'checkout',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.store_settings enable row level security;
alter table public.admin_users enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.reviews enable row level security;
alter table public.customers enable row level security;
alter table public.addresses enable row level security;
alter table public.discount_codes enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.shipments enable row level security;
alter table public.newsletter_subscribers enable row level security;

-- Public read: settings and active catalog.
create policy "settings are public" on public.store_settings for select to anon, authenticated using (true);
create policy "categories are public" on public.categories for select to anon, authenticated using (true);
create policy "active products are public" on public.products for select to anon, authenticated
  using (is_active or public.is_admin());
create policy "variants of active products are public" on public.product_variants for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_id and (p.is_active or public.is_admin())));
create policy "images of active products are public" on public.product_images for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_id and (p.is_active or public.is_admin())));
create policy "approved reviews are public" on public.reviews for select to anon, authenticated
  using (is_approved or public.is_admin());

-- Signed-in customers can read their own data (for future customer accounts).
create policy "customers read own profile" on public.customers for select to authenticated
  using (auth_user_id = auth.uid());
create policy "customers read own orders" on public.orders for select to authenticated
  using (exists (select 1 from public.customers c where c.id = customer_id and c.auth_user_id = auth.uid()));
create policy "customers read own order items" on public.order_items for select to authenticated
  using (exists (
    select 1 from public.orders o join public.customers c on c.id = o.customer_id
    where o.id = order_id and c.auth_user_id = auth.uid()
  ));

-- Admins: full access.
create policy "admins manage settings" on public.store_settings for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "admins read admin list" on public.admin_users for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy "admins manage categories" on public.categories for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "admins manage products" on public.products for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "admins manage variants" on public.product_variants for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "admins manage images" on public.product_images for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "admins manage reviews" on public.reviews for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "admins manage customers" on public.customers for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "admins manage addresses" on public.addresses for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "admins manage discounts" on public.discount_codes for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "admins manage orders" on public.orders for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "admins manage order items" on public.order_items for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "admins manage shipments" on public.shipments for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "admins manage newsletter" on public.newsletter_subscribers for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Shipping rule (one definition, used by place_order and mirrored in lib/pricing.ts)
-- Free shipping applies when the merchandise subtotal (before discounts) reaches the threshold.
-- ---------------------------------------------------------------------------
create or replace function public.shipping_for(p_subtotal numeric)
returns numeric
language sql
stable
set search_path = ''
as $$
  select case
    when s.free_shipping_threshold is not null and p_subtotal >= s.free_shipping_threshold then 0
    else s.shipping_fee
  end
  from public.store_settings s
  where s.id = 1;
$$;

-- ---------------------------------------------------------------------------
-- Discount preview (read-only; used by the checkout "Apply" button)
-- ---------------------------------------------------------------------------
create or replace function public.preview_discount(p_code text, p_subtotal numeric)
returns table (code text, amount numeric)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v public.discount_codes;
begin
  select * into v from public.discount_codes d where d.code = upper(trim(p_code));
  if not found or not v.is_active
     or (v.starts_at is not null and v.starts_at > now())
     or (v.ends_at is not null and v.ends_at < now())
     or (v.max_uses is not null and v.used_count >= v.max_uses) then
    raise exception 'DISCOUNT_INVALID' using errcode = 'P0001';
  end if;
  if p_subtotal < v.min_subtotal then
    raise exception 'DISCOUNT_MIN_SUBTOTAL' using errcode = 'P0001', hint = v.min_subtotal::text;
  end if;
  code := v.code;
  amount := case when v.type = 'percent' then round(p_subtotal * v.value / 100, 2) else least(v.value, p_subtotal) end;
  return next;
end;
$$;

-- ---------------------------------------------------------------------------
-- place_order: validates the cart against real prices and stock, applies the discount
-- and shipping rule, decrements stock and writes the order, all in one transaction.
-- Errors are raised with stable messages the app maps to user-facing text:
--   EMPTY_CART, INVALID_QUANTITY, INVALID_INPUT, PRODUCT_UNAVAILABLE (hint: slug|size),
--   OUT_OF_STOCK (hint: slug|size|available), DISCOUNT_*, PRICE_CHANGED (hint: new total)
-- ---------------------------------------------------------------------------
create or replace function public.place_order(
  p_full_name text,
  p_phone text,
  p_email text,
  p_city text,
  p_address text,
  p_notes text,
  p_items jsonb,
  p_discount_code text default null,
  p_newsletter boolean default false,
  p_expected_total numeric default null
)
returns table (order_id uuid, order_number text, public_token uuid, total numeric)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_settings public.store_settings;
  v_customer_id uuid;
  v_address_id uuid;
  v_order public.orders;
  v_subtotal numeric(10, 2) := 0;
  v_discount numeric(10, 2) := 0;
  v_discount_code text;
  v_shipping numeric(10, 2);
  v_total numeric(10, 2);
  v_email text := nullif(lower(trim(coalesce(p_email, ''))), '');
  r record;
begin
  -- Input validation (the app validates first; this is the last line of defence).
  if char_length(trim(coalesce(p_full_name, ''))) not between 2 and 100
     or coalesce(p_phone, '') !~ '^\+212[5-7][0-9]{8}$'
     or char_length(trim(coalesce(p_city, ''))) not between 2 and 60
     or char_length(trim(coalesce(p_address, ''))) not between 5 and 300
     or char_length(coalesce(p_notes, '')) > 500
     or (v_email is not null and (char_length(v_email) > 254 or v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$')) then
    raise exception 'INVALID_INPUT' using errcode = 'P0001';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'EMPTY_CART' using errcode = 'P0001';
  end if;
  if jsonb_array_length(p_items) > 50 then
    raise exception 'INVALID_QUANTITY' using errcode = 'P0001';
  end if;

  select * into v_settings from public.store_settings where id = 1;

  -- Resolve every line (merging duplicates) against the live catalog.
  drop table if exists pg_temp._lines;
  create temporary table _lines on commit drop as
  select
    i.slug,
    i.size,
    sum(i.quantity)::int as quantity,
    p.id as product_id,
    p.name,
    p.color,
    p.price,
    (p.is_active and v.is_active) as available,
    v.id as variant_id,
    v.sku,
    (select pi.url from public.product_images pi where pi.product_id = p.id order by pi.sort_order limit 1) as image_url
  from jsonb_to_recordset(p_items) as i (slug text, size text, quantity int)
  left join public.products p on p.slug = i.slug
  left join public.product_variants v on v.product_id = p.id and v.size = i.size
  group by i.slug, i.size, p.id, p.name, p.color, p.price, p.is_active, v.is_active, v.id, v.sku;

  for r in select * from pg_temp._lines loop
    if r.quantity is null or r.quantity < 1 or r.quantity > 20 then
      raise exception 'INVALID_QUANTITY' using errcode = 'P0001';
    end if;
    if r.variant_id is null or not r.available then
      raise exception 'PRODUCT_UNAVAILABLE' using errcode = 'P0001', hint = coalesce(r.slug, '') || '|' || coalesce(r.size, '');
    end if;
  end loop;

  -- Decrement stock atomically; rows are locked in id order to avoid deadlocks.
  for r in select * from pg_temp._lines order by variant_id loop
    update public.product_variants pv
       set stock = pv.stock - r.quantity
     where pv.id = r.variant_id and pv.stock >= r.quantity;
    if not found then
      raise exception 'OUT_OF_STOCK' using errcode = 'P0001',
        hint = r.slug || '|' || r.size || '|' || (select pv.stock from public.product_variants pv where pv.id = r.variant_id)::text;
    end if;
  end loop;

  select coalesce(sum(l.price * l.quantity), 0) into v_subtotal from pg_temp._lines l;

  if nullif(trim(coalesce(p_discount_code, '')), '') is not null then
    select d.code, d.amount into v_discount_code, v_discount from public.preview_discount(p_discount_code, v_subtotal) d;
    update public.discount_codes set used_count = used_count + 1 where code = v_discount_code;
  end if;

  v_shipping := public.shipping_for(v_subtotal);
  v_total := v_subtotal - v_discount + v_shipping;

  if p_expected_total is not null and p_expected_total <> v_total then
    raise exception 'PRICE_CHANGED' using errcode = 'P0001', hint = v_total::text;
  end if;

  insert into public.customers (full_name, phone, email)
  values (trim(p_full_name), p_phone, v_email)
  on conflict (phone) do update
    set full_name = excluded.full_name,
        email = coalesce(excluded.email, public.customers.email)
  returning id into v_customer_id;

  insert into public.addresses (customer_id, city, address_line)
  values (v_customer_id, trim(p_city), trim(p_address))
  returning id into v_address_id;

  insert into public.orders (
    customer_id, address_id, full_name, phone, email, city, address_line, notes,
    currency_code, subtotal, discount_code, discount_amount, shipping_fee, total
  ) values (
    v_customer_id, v_address_id, trim(p_full_name), p_phone, v_email, trim(p_city), trim(p_address),
    nullif(trim(coalesce(p_notes, '')), ''),
    v_settings.currency_code, v_subtotal, v_discount_code, v_discount, v_shipping, v_total
  )
  returning * into v_order;

  insert into public.order_items (
    order_id, product_id, variant_id, product_slug, product_name, color, size, sku, image_url,
    unit_price, quantity, line_total
  )
  select v_order.id, l.product_id, l.variant_id, l.slug, l.name, l.color, l.size, l.sku, l.image_url,
         l.price, l.quantity, l.price * l.quantity
  from pg_temp._lines l;

  if p_newsletter and v_email is not null then
    insert into public.newsletter_subscribers (email, source) values (v_email, 'checkout')
    on conflict (email) do nothing;
  end if;

  order_id := v_order.id;
  order_number := v_order.order_number;
  public_token := v_order.public_token;
  total := v_order.total;
  return next;
end;
$$;

-- ---------------------------------------------------------------------------
-- set_order_status: admin-only. Moving to cancelled/returned puts the stock back once.
-- A restocked order cannot be reopened (its stock may already be sold again).
-- ---------------------------------------------------------------------------
create or replace function public.set_order_status(p_order_id uuid, p_status public.order_status)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders;
begin
  if not public.is_admin() then
    raise exception 'NOT_AUTHORIZED' using errcode = '42501';
  end if;

  select * into v_order from public.orders where id = p_order_id for update;
  if not found then
    raise exception 'ORDER_NOT_FOUND' using errcode = 'P0001';
  end if;
  if v_order.status = p_status then
    return;
  end if;
  if v_order.restocked then
    raise exception 'ORDER_CLOSED' using errcode = 'P0001';
  end if;

  if p_status in ('cancelled', 'returned') then
    update public.product_variants pv
       set stock = pv.stock + oi.quantity
      from public.order_items oi
     where oi.order_id = p_order_id and oi.variant_id = pv.id;
    update public.orders set status = p_status, restocked = true where id = p_order_id;
  else
    update public.orders set status = p_status where id = p_order_id;
  end if;

  if p_status = 'shipped' then
    insert into public.shipments (order_id, shipped_at) values (p_order_id, now())
    on conflict (order_id) do update set shipped_at = coalesce(public.shipments.shipped_at, now());
  elsif p_status = 'delivered' then
    insert into public.shipments (order_id, delivered_at) values (p_order_id, now())
    on conflict (order_id) do update set delivered_at = coalesce(public.shipments.delivered_at, now());
  end if;
end;
$$;

-- Function privileges: place_order only with the secret (service_role) key.
revoke execute on function public.place_order(text, text, text, text, text, text, jsonb, text, boolean, numeric) from public, anon, authenticated;
grant execute on function public.place_order(text, text, text, text, text, text, jsonb, text, boolean, numeric) to service_role;
revoke execute on function public.preview_discount(text, numeric) from public, anon, authenticated;
grant execute on function public.preview_discount(text, numeric) to service_role;
revoke execute on function public.set_order_status(uuid, public.order_status) from public, anon;
grant execute on function public.set_order_status(uuid, public.order_status) to authenticated;

-- ---------------------------------------------------------------------------
-- Storage: public bucket for product photos, writable by admins only.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do nothing;

create policy "admins upload product images" on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());
create policy "admins update product images" on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and public.is_admin());
create policy "admins delete product images" on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and public.is_admin());
