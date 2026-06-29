-- =====================================================================
-- EWAAN — تمكين الخدمة الذاتية للمستأجر (بوابة المستأجر)
-- السماح للمستأجر برفع طلب صيانة لوحدته دون عضوية في المؤسسة.
-- =====================================================================

drop policy if exists requests_tenant_insert on public.maintenance_requests;
create policy requests_tenant_insert on public.maintenance_requests for insert to authenticated
  with check (
    public.has_permission(organization_id,'maintenance.manage')
    or exists (
      select 1 from public.tenants t
      where t.id = tenant_id and t.user_id = (select auth.uid())
    )
  );