-- Add order lifecycle tracking columns to the orders table.
-- These let the admin track each order through its full lifecycle:
-- accepted/rejected → paid/unpaid → sent/received.

alter table public.orders
  add column if not exists order_status   text not null default 'pending'
    check (order_status   in ('pending', 'accepted', 'rejected')),
  add column if not exists payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid', 'paid')),
  add column if not exists shipping_status text not null default 'not_sent'
    check (shipping_status in ('not_sent', 'sent', 'received'));

-- Index for fast admin dashboard queries by status
create index if not exists idx_orders_order_status    on public.orders(order_status);
create index if not exists idx_orders_created_at      on public.orders(created_at desc);
