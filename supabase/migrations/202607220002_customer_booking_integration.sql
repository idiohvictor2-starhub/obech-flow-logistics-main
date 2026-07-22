-- Add missing special_instructions column to shipments table
-- and ensure realtime configuration for public.shipments

alter table public.shipments
  add column if not exists special_instructions text;

comment on column public.shipments.special_instructions is
  'Customer notes, item category, and special instructions for online bookings';

-- Ensure table is part of realtime publication
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'shipments'
  ) then
    alter publication supabase_realtime add table public.shipments;
  end if;
exception
  when undefined_object then
    null;
end $$;
