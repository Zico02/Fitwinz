-- Optional "Order cancelled" email. Additive only: safe to run while the site is live.

alter type public.order_email_kind add value if not exists 'cancelled';

-- Reason the admin gave when cancelling (shown in the cancellation email, if sent).
alter table public.orders
  add column if not exists cancellation_reason text
  check (cancellation_reason is null or char_length(cancellation_reason) <= 500);
