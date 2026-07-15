-- Admin office bookings and printable receipt support.
-- Safe to apply to the existing Obech Flow Logistics Supabase project.

alter table public.shipments
  alter column client_email drop not null;

alter table public.shipments
  add column if not exists booking_source text not null default 'online',
  add column if not exists receipt_number text,
  add column if not exists total_amount numeric(12,2) not null default 0,
  add column if not exists amount_paid numeric(12,2) not null default 0,
  add column if not exists payment_status text not null default 'unpaid',
  add column if not exists payment_method text,
  add column if not exists payment_reference text,
  add column if not exists created_by text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'shipments_booking_source_check'
      and conrelid = 'public.shipments'::regclass
  ) then
    alter table public.shipments
      add constraint shipments_booking_source_check
      check (booking_source in ('online', 'office'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'shipments_total_amount_check'
      and conrelid = 'public.shipments'::regclass
  ) then
    alter table public.shipments
      add constraint shipments_total_amount_check
      check (total_amount >= 0);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'shipments_amount_paid_check'
      and conrelid = 'public.shipments'::regclass
  ) then
    alter table public.shipments
      add constraint shipments_amount_paid_check
      check (amount_paid >= 0 and amount_paid <= total_amount);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'shipments_payment_status_check'
      and conrelid = 'public.shipments'::regclass
  ) then
    alter table public.shipments
      add constraint shipments_payment_status_check
      check (payment_status in ('unpaid', 'partial', 'paid'));
  end if;
end $$;

create unique index if not exists shipments_receipt_number_key
  on public.shipments (receipt_number)
  where receipt_number is not null;

comment on column public.shipments.booking_source is
  'online for customer self-service bookings; office for admin-created walk-in bookings';

comment on column public.shipments.receipt_number is
  'Unique receipt identifier assigned to an office booking';
