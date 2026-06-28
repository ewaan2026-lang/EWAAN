
-- =====================================================================
-- EWAAN — المرحلة 0: أساس العزل متعدد المؤسسات + RBAC + RLS + التدقيق
-- =====================================================================

-- ---------- Enums ----------
create type public.org_status as enum ('active','suspended');
create type public.subscription_tier as enum ('basic','professional','enterprise');
create type public.member_status as enum ('active','invited','disabled');

-- ---------- updated_at helper ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

-- ---------- Core tables ----------
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  legal_name text,
  cr_number text,            -- رقم السجل التجاري
  vat_number text,           -- الرقم الضريبي
  email text,
  phone text,
  address jsonb,
  default_locale text not null default 'ar' check (default_locale in ('ar','en')),
  status public.org_status not null default 'active',
  subscription_tier public.subscription_tier not null default 'basic',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_org_updated before update on public.organizations
  for each row execute function public.set_updated_at();

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  avatar_url text,
  preferred_locale text not null default 'ar' check (preferred_locale in ('ar','en')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_profile_updated before update on public.profiles
  for each row execute function public.set_updated_at();

create table public.permissions (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  category text,
  description text
);

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  key text not null,                 -- admin | owner | staff | tenant | <custom>
  name text not null,
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, key)
);
create trigger trg_role_updated before update on public.roles
  for each row execute function public.set_updated_at();

create table public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

create table public.org_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role_id uuid not null references public.roles(id),
  scope jsonb not null default '{}'::jsonb,   -- {"portfolio_ids":[],"property_ids":[]}
  status public.member_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, user_id)
);
create index idx_org_members_user on public.org_members(user_id);
create index idx_org_members_org on public.org_members(organization_id);
create trigger trg_member_updated before update on public.org_members
  for each row execute function public.set_updated_at();

create table public.audit_logs (
  id bigint generated always as identity primary key,
  organization_id uuid references public.organizations(id) on delete set null,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  changes jsonb,
  ip text,
  user_agent text,
  created_at timestamptz not null default now()
);
create index idx_audit_org on public.audit_logs(organization_id);
create index idx_audit_entity on public.audit_logs(entity_type, entity_id);

-- ---------- RLS helper functions (SECURITY DEFINER, no recursion) ----------
create or replace function public.user_org_ids()
returns setof uuid language sql stable security definer set search_path = '' as $$
  select organization_id from public.org_members
  where user_id = (select auth.uid()) and status = 'active';
$$;

create or replace function public.is_org_member(p_org uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.org_members
    where user_id = (select auth.uid())
      and organization_id = p_org and status = 'active'
  );
$$;

create or replace function public.is_org_admin(p_org uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.org_members m
    join public.roles r on r.id = m.role_id
    where m.user_id = (select auth.uid())
      and m.organization_id = p_org and m.status = 'active'
      and r.key in ('admin','owner')
  );
$$;

create or replace function public.has_permission(p_org uuid, p_perm text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1
    from public.org_members m
    join public.role_permissions rp on rp.role_id = m.role_id
    join public.permissions p on p.id = rp.permission_id
    where m.user_id = (select auth.uid())
      and m.organization_id = p_org and m.status = 'active'
      and p.key = p_perm
  );
$$;

-- ---------- Auto-create profile on signup ----------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, full_name, phone)
  values (new.id, new.email,
          coalesce(new.raw_user_meta_data->>'full_name',''), new.phone)
  on conflict (id) do nothing;
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Seed default roles + permissions when an org is created ----------
create or replace function public.seed_default_org_roles()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_admin uuid; v_owner uuid; v_staff uuid; v_tenant uuid;
begin
  insert into public.roles(organization_id,key,name,is_system) values (new.id,'admin','مدير المنشأة',true) returning id into v_admin;
  insert into public.roles(organization_id,key,name,is_system) values (new.id,'owner','مالك',true) returning id into v_owner;
  insert into public.roles(organization_id,key,name,is_system) values (new.id,'staff','موظف',true) returning id into v_staff;
  insert into public.roles(organization_id,key,name,is_system) values (new.id,'tenant','مستأجر',true) returning id into v_tenant;

  insert into public.role_permissions(role_id,permission_id)
    select v_admin, id from public.permissions;
  insert into public.role_permissions(role_id,permission_id)
    select v_owner, id from public.permissions
    where key in ('properties.read','units.read','leases.read','payments.read',
                  'invoices.read','reports.read','owner_statements.read',
                  'owners.read','maintenance.read');
  insert into public.role_permissions(role_id,permission_id)
    select v_staff, id from public.permissions
    where key in ('properties.read','properties.write','units.read','units.write',
                  'leases.read','leases.write','payments.read','payments.manage',
                  'invoices.read','invoices.manage','maintenance.read','maintenance.manage',
                  'owners.read','reports.read');
  insert into public.role_permissions(role_id,permission_id)
    select v_tenant, id from public.permissions
    where key in ('tenant.portal','maintenance.request','invoices.read',
                  'payments.read','leases.read');
  return new;
end; $$;
create trigger trg_seed_org_roles after insert on public.organizations
  for each row execute function public.seed_default_org_roles();

-- ---------- RPC: create organization + make caller admin ----------
create or replace function public.create_organization(p_name text, p_slug text default null)
returns public.organizations language plpgsql security definer set search_path = '' as $$
declare v_org public.organizations; v_admin_role uuid;
begin
  if (select auth.uid()) is null then raise exception 'not authenticated'; end if;
  insert into public.organizations(name, slug) values (p_name, p_slug) returning * into v_org;
  select id into v_admin_role from public.roles where organization_id = v_org.id and key='admin';
  insert into public.org_members(organization_id,user_id,role_id,status)
    values (v_org.id, (select auth.uid()), v_admin_role, 'active');
  return v_org;
end; $$;

-- ---------- Seed global permissions catalog ----------
insert into public.permissions(key,category,description) values
  ('properties.read','properties','عرض العقارات'),
  ('properties.write','properties','تعديل/إضافة العقارات'),
  ('properties.delete','properties','حذف العقارات'),
  ('units.read','units','عرض الوحدات'),
  ('units.write','units','تعديل/إضافة الوحدات'),
  ('owners.read','owners','عرض الملّاك'),
  ('owners.write','owners','تعديل/إضافة الملّاك'),
  ('owner_statements.read','finance','عرض كشوف الملّاك'),
  ('leases.read','leases','عرض العقود'),
  ('leases.write','leases','تعديل/إضافة العقود'),
  ('leases.terminate','leases','إنهاء العقود'),
  ('invoices.read','finance','عرض الفواتير'),
  ('invoices.manage','finance','إدارة الفواتير'),
  ('payments.read','finance','عرض المدفوعات'),
  ('payments.manage','finance','إدارة المدفوعات'),
  ('maintenance.read','maintenance','عرض الصيانة'),
  ('maintenance.manage','maintenance','إدارة الصيانة'),
  ('maintenance.request','maintenance','رفع طلب صيانة (مستأجر)'),
  ('reports.read','reports','عرض التقارير'),
  ('members.manage','admin','إدارة المستخدمين'),
  ('roles.manage','admin','إدارة الأدوار والصلاحيات'),
  ('settings.manage','admin','إدارة إعدادات المؤسسة'),
  ('tenant.portal','tenant','الوصول لبوابة المستأجر');

-- ---------- Enable RLS ----------
alter table public.organizations   enable row level security;
alter table public.profiles        enable row level security;
alter table public.permissions     enable row level security;
alter table public.roles           enable row level security;
alter table public.role_permissions enable row level security;
alter table public.org_members     enable row level security;
alter table public.audit_logs      enable row level security;

-- organizations
create policy org_select on public.organizations for select to authenticated
  using (public.is_org_member(id));
create policy org_update on public.organizations for update to authenticated
  using (public.is_org_admin(id)) with check (public.is_org_admin(id));
-- (no direct insert: use public.create_organization RPC)

-- profiles
create policy profile_select_self on public.profiles for select to authenticated
  using (id = (select auth.uid())
         or exists (select 1 from public.org_members m1
                    join public.org_members m2 on m1.organization_id = m2.organization_id
                    where m1.user_id = (select auth.uid()) and m2.user_id = public.profiles.id));
create policy profile_update_self on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- permissions (global read-only catalog)
create policy perm_read on public.permissions for select to authenticated using (true);

-- roles
create policy role_select on public.roles for select to authenticated
  using (public.is_org_member(organization_id));
create policy role_write on public.roles for all to authenticated
  using (public.is_org_admin(organization_id) and public.has_permission(organization_id,'roles.manage'))
  with check (public.is_org_admin(organization_id) and public.has_permission(organization_id,'roles.manage'));

-- role_permissions
create policy rp_select on public.role_permissions for select to authenticated
  using (exists (select 1 from public.roles r where r.id = role_id
                 and public.is_org_member(r.organization_id)));
create policy rp_write on public.role_permissions for all to authenticated
  using (exists (select 1 from public.roles r where r.id = role_id
                 and public.is_org_admin(r.organization_id)
                 and public.has_permission(r.organization_id,'roles.manage')))
  with check (exists (select 1 from public.roles r where r.id = role_id
                 and public.is_org_admin(r.organization_id)
                 and public.has_permission(r.organization_id,'roles.manage')));

-- org_members
create policy member_select on public.org_members for select to authenticated
  using (organization_id in (select public.user_org_ids()));
create policy member_write on public.org_members for all to authenticated
  using (public.is_org_admin(organization_id) and public.has_permission(organization_id,'members.manage'))
  with check (public.is_org_admin(organization_id) and public.has_permission(organization_id,'members.manage'));

-- audit_logs
create policy audit_select on public.audit_logs for select to authenticated
  using (public.is_org_admin(organization_id));
create policy audit_insert on public.audit_logs for insert to authenticated
  with check (organization_id in (select public.user_org_ids())
              and actor_id = (select auth.uid()));
