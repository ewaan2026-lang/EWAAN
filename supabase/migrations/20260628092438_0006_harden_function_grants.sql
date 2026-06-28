
-- =====================================================================
-- EWAAN — تشديد الدوال: ضبط search_path + منع الاستدعاء الخارجي
-- =====================================================================

-- 1) ضبط search_path للدالة الوحيدة الناقصة
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end; $$;

-- 2) دوال المُشغّلات (Triggers) — تُستدعى داخلياً فقط، تُمنع تماماً من الـ API
revoke all on function public.set_updated_at()         from anon, authenticated, public;
revoke all on function public.handle_new_user()        from anon, authenticated, public;
revoke all on function public.seed_default_org_roles() from anon, authenticated, public;

-- 3) دوال RLS المساعدة — تُمنع من anon، وتبقى متاحة للمستخدم المسجّل (يحتاجها RLS)
revoke all on function public.user_org_ids()              from anon, public;
revoke all on function public.is_org_member(uuid)         from anon, public;
revoke all on function public.is_org_admin(uuid)          from anon, public;
revoke all on function public.has_permission(uuid, text)  from anon, public;
revoke all on function public.is_lease_tenant(uuid)       from anon, public;
revoke all on function public.is_owner_self(uuid)         from anon, public;

grant execute on function public.user_org_ids()             to authenticated, service_role;
grant execute on function public.is_org_member(uuid)        to authenticated, service_role;
grant execute on function public.is_org_admin(uuid)         to authenticated, service_role;
grant execute on function public.has_permission(uuid, text) to authenticated, service_role;
grant execute on function public.is_lease_tenant(uuid)      to authenticated, service_role;
grant execute on function public.is_owner_self(uuid)        to authenticated, service_role;

-- 4) RPC إنشاء المؤسسة — للمستخدم المسجّل فقط (يُمنع anon)
revoke all on function public.create_organization(text, text) from anon, public;
grant execute on function public.create_organization(text, text) to authenticated, service_role;
