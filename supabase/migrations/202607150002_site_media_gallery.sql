-- Global website photo management.
-- Admins can upload from their device gallery or save a direct image URL.

create table if not exists public.site_media (
  slot_key text primary key,
  image_url text not null,
  storage_path text,
  updated_by text,
  updated_at timestamptz not null default now(),
  constraint site_media_slot_key_check check (
    slot_key in (
      'hero_bg',
      'why_us',
      'service_bike',
      'service_van',
      'service_truck',
      'service_business'
    )
  )
);

alter table public.site_media enable row level security;

drop policy if exists "Public can view site media" on public.site_media;
create policy "Public can view site media"
  on public.site_media
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins can manage site media" on public.site_media;
create policy "Admins can manage site media"
  on public.site_media
  for all
  to authenticated
  using (true)
  with check (true);

grant select on public.site_media to anon, authenticated;
grant insert, update, delete on public.site_media to authenticated;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'site-media',
  'site-media',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view site media files" on storage.objects;
create policy "Public can view site media files"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'site-media');

drop policy if exists "Admins can upload site media files" on storage.objects;
create policy "Admins can upload site media files"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'site-media');

drop policy if exists "Admins can update site media files" on storage.objects;
create policy "Admins can update site media files"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'site-media')
  with check (bucket_id = 'site-media');

drop policy if exists "Admins can delete site media files" on storage.objects;
create policy "Admins can delete site media files"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'site-media');

do $$
begin
  if exists (
    select 1 from pg_publication where pubname = 'supabase_realtime'
  ) and not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'site_media'
  ) then
    alter publication supabase_realtime add table public.site_media;
  end if;
end $$;

comment on table public.site_media is
  'Globally shared image selections for editable public website photo positions.';
