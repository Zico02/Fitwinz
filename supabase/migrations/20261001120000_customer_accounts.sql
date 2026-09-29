-- Customer accounts: profiles, saved addresses, wishlist, orders linked to accounts,
-- and a rate limiter for the admin login.
-- Additive only (plus replacing two unused read policies): safe to run while the site is live.
-- Customers are ordinary Supabase Auth users WITHOUT a row in admin_users, so they never get
-- admin rights: every admin policy and action checks public.is_admin().

-- ---------------------------------------------------------------------------
-- Profiles (one per auth user)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text not null default '' check (char_length(first_name) <= 60),
  last_name text not null default '' check (char_length(last_name) <= 60),
  phone text check (phone is null or phone ~ '^\+212[5-7][0-9]{8}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- Creates the profile when someone signs up (names and newsletter choice come from signUp metadata).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, first_name, last_name)
  values (
    new.id,
    left(trim(coalesce(new.raw_user_meta_data ->> 'first_name', '')), 60),
    left(trim(coalesce(new.raw_user_meta_data ->> 'last_name', '')), 60)
  )
  on conflict (id) do nothing;

  if coalesce(new.raw_user_meta_data ->> 'newsletter', 'false') = 'true' and new.email is not null then
    insert into public.newsletter_subscribers (email, source)
    values (lower(new.email), 'signup')
    on conflict (email) do nothing;
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Saved addresses
-- ---------------------------------------------------------------------------
create table public.saved_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  full_name text not null check (char_length(full_name) between 2 and 100),
  phone text not null check (phone ~ '^\+212[5-7][0-9]{8}$'),
  city text not null check (char_length(city) between 2 and 60),
  address_line text not null check (char_length(address_line) between 5 and 300),
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index saved_addresses_user_idx on public.saved_addresses (user_id, created_at);
-- At most one default address per customer.
create unique index saved_addresses_one_default on public.saved_addresses (user_id) where is_default;

create trigger saved_addresses_updated_at before update on public.saved_addresses
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Wishlist
-- ---------------------------------------------------------------------------
create table public.wishlist_items (
  user_id uuid not null references auth.users (id) on delete cascade,
  product_slug text not null check (char_length(product_slug) between 1 and 120),
  created_at timestamptz not null default now(),
  primary key (user_id, product_slug)
);

-- ---------------------------------------------------------------------------
-- Orders linked to accounts (set by the server after checkout; null for guest orders)
-- ---------------------------------------------------------------------------
alter table public.orders add column if not exists user_id uuid references auth.users (id) on delete set null;
create index if not exists orders_user_idx on public.orders (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Row Level Security: a customer only ever sees their own rows
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.saved_addresses enable row level security;
alter table public.wishlist_items enable row level security;

create policy "own profile: read" on public.profiles for select to authenticated using (id = auth.uid());
create policy "own profile: create" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "own profile: update" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
create policy "admins read profiles" on public.profiles for select to authenticated using (public.is_admin());

create policy "own addresses: read" on public.saved_addresses for select to authenticated using (user_id = auth.uid());
create policy "own addresses: create" on public.saved_addresses for insert to authenticated with check (user_id = auth.uid());
create policy "own addresses: update" on public.saved_addresses for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own addresses: delete" on public.saved_addresses for delete to authenticated using (user_id = auth.uid());

create policy "own wishlist: read" on public.wishlist_items for select to authenticated using (user_id = auth.uid());
create policy "own wishlist: add" on public.wishlist_items for insert to authenticated with check (user_id = auth.uid());
create policy "own wishlist: remove" on public.wishlist_items for delete to authenticated using (user_id = auth.uid());

-- Replace the earlier (unused) customer read policies with ones based on orders.user_id.
drop policy if exists "customers read own orders" on public.orders;
drop policy if exists "customers read own order items" on public.order_items;

create policy "customers read own orders" on public.orders for select to authenticated
  using (user_id = auth.uid());
create policy "customers read own order items" on public.order_items for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "customers read own shipments" on public.shipments for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));

-- ---------------------------------------------------------------------------
-- Rate limiter (used by the admin login; customer sign-in/up use Supabase Auth's per-IP limits)
-- ---------------------------------------------------------------------------
create table public.rate_limit_hits (
  bucket text not null,
  created_at timestamptz not null default now()
);
create index rate_limit_hits_bucket_idx on public.rate_limit_hits (bucket, created_at);
alter table public.rate_limit_hits enable row level security; -- no policies: server only

-- Records a hit and returns true while the bucket is under p_max hits in the last p_window_seconds.
create or replace function public.rate_limit_allow(p_bucket text, p_max int, p_window_seconds int)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count int;
begin
  delete from public.rate_limit_hits
   where bucket = p_bucket and created_at < now() - make_interval(secs => p_window_seconds);
  select count(*) into v_count from public.rate_limit_hits where bucket = p_bucket;
  if v_count >= p_max then
    return false;
  end if;
  insert into public.rate_limit_hits (bucket) values (p_bucket);
  return true;
end;
$$;

revoke execute on function public.rate_limit_allow(text, int, int) from public, anon, authenticated;
grant execute on function public.rate_limit_allow(text, int, int) to service_role;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
