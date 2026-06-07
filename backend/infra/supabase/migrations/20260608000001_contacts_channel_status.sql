-- Add channel, phone, status, and replied_at to contacts table
-- Required for dual-channel (email/whatsapp) contact management system

alter table public.contacts
  add column if not exists channel text not null default 'email',
  add column if not exists phone text,
  add column if not exists status text not null default 'unread',
  add column if not exists replied_at timestamp with time zone;

-- email column is now optional (whatsapp contacts don't have one)
alter table public.contacts alter column email drop not null;

-- index for fast unread count and status filtering
create index if not exists idx_contacts_status on public.contacts(status);
