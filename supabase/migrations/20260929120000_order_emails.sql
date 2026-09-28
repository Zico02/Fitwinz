-- Transactional email log + tracking link for shipments.
-- Additive only: safe to run while the current site is live.

alter table public.shipments
  add column if not exists tracking_url text
  check (tracking_url is null or tracking_url ~ '^https?://');

create type public.order_email_kind as enum ('confirmation', 'admin_notification', 'shipped');

-- One row per send attempt. The partial unique index below guarantees an email of a given kind
-- is sent at most once per order: a sender first inserts a 'sending' row (the "claim"), and a
-- second concurrent or later attempt fails on the index. Failed attempts don't block a retry.
create table public.order_emails (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  kind public.order_email_kind not null,
  status text not null check (status in ('sending', 'sent', 'failed', 'skipped')),
  recipient text,
  provider_id text,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index order_emails_once on public.order_emails (order_id, kind) where status in ('sending', 'sent');
create index order_emails_order_idx on public.order_emails (order_id, created_at desc);

create trigger order_emails_updated_at before update on public.order_emails
  for each row execute function public.set_updated_at();

-- Written by the server with the secret key; admins can read it.
alter table public.order_emails enable row level security;
create policy "admins read order emails" on public.order_emails for select to authenticated
  using (public.is_admin());
