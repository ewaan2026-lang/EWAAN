
-- =====================================================================
-- EWAAN — المستأجرون + العقود + القوالب + جداول الدفعات
-- =====================================================================

create type public.payment_frequency as enum ('monthly','quarterly','semi_annual','annual');
create type public.lease_status as enum ('draft','active','expired','terminated','renewed');
create type public.late_fee_type as enum ('none','percentage','fixed');
create type public.schedule_status as enum ('pending','invoiced','paid','overdue','waived');

-- ---------- Tenants ----------
create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,  -- ربط حساب المستأجر (البوابة)
  full_name text not null,
  national_id text,
  email text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_tenants_org on public.tenants(organization_id);
create index idx_tenants_user on public.tenants(user_id);
create trigger trg_tenant_updated before update on public.tenants
  for each row execute function public.set_updated_at();

-- ---------- Lease templates + clause library ----------
create table public.lease_templates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  body text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_templates_org on public.lease_templates(organization_id);
create trigger trg_template_updated before update on public.lease_templates
  for each row execute function public.set_updated_at();

create table public.clause_library (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  body text not null,
  created_at timestamptz not null default now()
);
create index idx_clause_lib_org on public.clause_library(organization_id);

-- ---------- Leases ----------
create table public.leases (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  unit_id uuid not null references public.units(id) on delete restrict,
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  template_id uuid references public.lease_templates(id) on delete set null,
  contract_number text,
  ejar_contract_id text,                 -- محجوز لمزامنة إيجار لاحقاً
  start_date date not null,
  end_date date not null,
  rent_amount numeric(12,2) not null,
  payment_frequency public.payment_frequency not null default 'monthly',
  deposit_amount numeric(12,2) default 0,   -- التأمين/العربون: تسجيل المبلغ فقط
  -- منطق التأخر (configurable لكل عقد)
  late_fee_type public.late_fee_type not null default 'none',
  late_fee_value numeric(12,2) default 0,
  grace_period_days int not null default 0,
  -- التجديد (تلقائي/يدوي حسب العقد)
  auto_renew boolean not null default false,
  renewal_notice_days int default 30,
  status public.lease_status not null default 'draft',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date >= start_date)
);
create index idx_leases_org on public.leases(organization_id);
create index idx_leases_unit on public.leases(unit_id);
create index idx_leases_tenant on public.leases(tenant_id);
create index idx_leases_status on public.leases(status);
create trigger trg_lease_updated before update on public.leases
  for each row execute function public.set_updated_at();

-- ---------- Lease clauses (snapshot per lease) ----------
create table public.lease_clauses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  lease_id uuid not null references public.leases(id) on delete cascade,
  title text not null,
  body text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index idx_lease_clauses_lease on public.lease_clauses(lease_id);

-- ---------- Payment schedules ----------
create table public.payment_schedules (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  lease_id uuid not null references public.leases(id) on delete cascade,
  sequence int not null,
  due_date date not null,
  amount numeric(12,2) not null,
  status public.schedule_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lease_id, sequence)
);
create index idx_schedules_org on public.payment_schedules(organization_id);
create index idx_schedules_lease on public.payment_schedules(lease_id);
create index idx_schedules_due on public.payment_schedules(due_date);
create trigger trg_schedule_updated before update on public.payment_schedules
  for each row execute function public.set_updated_at();

-- ---------- Helper: is current user the tenant of a lease ----------
create or replace function public.is_lease_tenant(p_lease uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.leases l
    join public.tenants t on t.id = l.tenant_id
    where l.id = p_lease and t.user_id = (select auth.uid())
  );
$$;

-- ---------- RLS ----------
alter table public.tenants          enable row level security;
alter table public.lease_templates  enable row level security;
alter table public.clause_library   enable row level security;
alter table public.leases           enable row level security;
alter table public.lease_clauses    enable row level security;
alter table public.payment_schedules enable row level security;

-- tenants: staff (leases.read) or the tenant themselves
create policy tenants_select on public.tenants for select to authenticated
  using (public.has_permission(organization_id,'leases.read') or user_id = (select auth.uid()));
create policy tenants_write on public.tenants for all to authenticated
  using (public.has_permission(organization_id,'leases.write'))
  with check (public.has_permission(organization_id,'leases.write'));

-- lease_templates
create policy templates_select on public.lease_templates for select to authenticated
  using (public.is_org_member(organization_id));
create policy templates_write on public.lease_templates for all to authenticated
  using (public.has_permission(organization_id,'leases.write'))
  with check (public.has_permission(organization_id,'leases.write'));

-- clause_library
create policy clauses_lib_select on public.clause_library for select to authenticated
  using (public.is_org_member(organization_id));
create policy clauses_lib_write on public.clause_library for all to authenticated
  using (public.has_permission(organization_id,'leases.write'))
  with check (public.has_permission(organization_id,'leases.write'));

-- leases: staff (leases.read) or the lease's tenant
create policy leases_select on public.leases for select to authenticated
  using (public.has_permission(organization_id,'leases.read')
         or exists (select 1 from public.tenants t
                    where t.id = tenant_id and t.user_id = (select auth.uid())));
create policy leases_write on public.leases for all to authenticated
  using (public.has_permission(organization_id,'leases.write'))
  with check (public.has_permission(organization_id,'leases.write'));

-- lease_clauses
create policy lease_clauses_select on public.lease_clauses for select to authenticated
  using (public.has_permission(organization_id,'leases.read') or public.is_lease_tenant(lease_id));
create policy lease_clauses_write on public.lease_clauses for all to authenticated
  using (public.has_permission(organization_id,'leases.write'))
  with check (public.has_permission(organization_id,'leases.write'));

-- payment_schedules
create policy schedules_select on public.payment_schedules for select to authenticated
  using (public.has_permission(organization_id,'payments.read') or public.is_lease_tenant(lease_id));
create policy schedules_write on public.payment_schedules for all to authenticated
  using (public.has_permission(organization_id,'payments.manage'))
  with check (public.has_permission(organization_id,'payments.manage'));
