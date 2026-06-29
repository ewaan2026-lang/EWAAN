-- =====================================================================
-- EWAAN — حقول إضافية عميقة + مخزن الوسائط (Storage)
-- =====================================================================

-- حقول الوحدات
alter table public.units add column if not exists features text[] not null default '{}';
alter table public.units add column if not exists listing_text text;
alter table public.units add column if not exists has_water_tank boolean not null default false;

-- حقول العقارات
alter table public.properties add column if not exists services text[] not null default '{}';
alter table public.properties add column if not exists whatsapp_group_url text;

-- مخزن الوسائط (قراءة عامة، رفع/حذف للمستخدمين المسجّلين)
insert into storage.buckets (id, name, public)
  values ('media', 'media', true)
  on conflict (id) do nothing;

drop policy if exists media_public_read on storage.objects;
create policy media_public_read on storage.objects for select to public
  using (bucket_id = 'media');

drop policy if exists media_auth_insert on storage.objects;
create policy media_auth_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'media');

drop policy if exists media_auth_update on storage.objects;
create policy media_auth_update on storage.objects for update to authenticated
  using (bucket_id = 'media');

drop policy if exists media_auth_delete on storage.objects;
create policy media_auth_delete on storage.objects for delete to authenticated
  using (bucket_id = 'media');