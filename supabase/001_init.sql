-- Shroomscape schema.
-- Apply once a project exists:  supabase db execute -f supabase/001_init.sql
-- or paste into the SQL editor.

create table if not exists public.orders (
  id             uuid primary key default gen_random_uuid(),
  order_ref      text unique not null,
  customer_name  text not null,
  phone          text not null,
  address        text not null,
  note           text,
  items          jsonb not null default '[]'::jsonb,
  total          numeric,                -- null until the shop quotes a price
  payment_method text not null default 'cod'
                 check (payment_method in ('cod','bkash')),
  bkash_number   text,
  bkash_trxid    text,
  status         text not null default 'enquiry'
                 check (status in ('enquiry','quoted','confirmed','paid','delivered','cancelled')),
  created_at     timestamptz not null default now()
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx    on public.orders (status);
create index if not exists orders_phone_idx     on public.orders (phone);

create table if not exists public.messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  contact    text,
  message    text not null,
  handled    boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists messages_created_at_idx on public.messages (created_at desc);

-- Optional: the catalogue also lives in the repo as typed content, which is
-- what the site actually renders. These tables exist so the shop can move to
-- editing stock and copy from Supabase later without a schema change.
create table if not exists public.varieties (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  name_en      text not null,
  name_bn      text not null,
  latin        text,
  image        text,
  blurb        text,
  benefits     jsonb default '[]'::jsonb,
  origin       text,
  history      text,
  culinary_use text,
  in_stock     boolean not null default false,
  price        numeric,
  updated_at   timestamptz not null default now()
);

-- Row level security: orders and messages are written only by the server,
-- which uses the service role key and bypasses RLS. Enabling it with no
-- permissive policy means the public anon key can neither read nor write,
-- which is exactly what we want for customer data.
alter table public.orders   enable row level security;
alter table public.messages enable row level security;

-- The catalogue is public information, so it may be read by anyone.
alter table public.varieties enable row level security;
drop policy if exists varieties_public_read on public.varieties;
create policy varieties_public_read on public.varieties for select using (true);
