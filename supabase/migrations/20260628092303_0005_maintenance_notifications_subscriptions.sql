
-- =====================================================================
-- EWAAN — الصيانة + الإشعارات + الاشتراكات
-- =====================================================================

create type public.provider_type as enum ('internal','external');
create type public.maintenance_priority as enum ('low','medium','high','urgent');
create type public.maintenance_status as enum ('new','assigned','in_progress','on_hold','completed','cancelled');
create type public.notification_channel as enum ('in_app','email','sms','whatsapp');
create type public.notification_status as enum ('pending','sent','failed');
create type public.subscription_status as enum ('trialing','active','past_due','cancelled');
create type public.billing_cycle as enum ('monthly','annual');

-- ---------- Service providers ----------
create table public.service_providers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  type public.provider_type not null default 'external',
  specialty text,
  contact_person text,
  phone text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_providers_org on public.service_providers(organization_id);
create trigger trg_provider_updated before update on public.service_providers
  for each row execute function public.set_updated_at();

-- ---------- Maintenance requests ----------
create table public.maintenance_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  unit_id uuid not null references public.units(id) on delete cascade,
  lease_id uuid references public.leases(id) on delete set null,
  tenant_id uuid references public.tenants(id) on delete set null,
  title text not null,
  description text,
  category text,
  priority public.maintenance_priority not null default 'medium',
  status public.maintenance_status not null default 'new',
  reported_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_requests_org on public.maintenance_requests(organization_id);
create index idx_requests_unit on public.maintenance_requests(unit_id);
create index idx_requests_status on public.maintenance_requests(status);
create trigger trg_request_updated before update on public.maintenance_requests
  for each row execute function public.set_updated_at();

-- ---------- Maintenance tasks (توزيع المهام) ----------
create table public.maintenance_tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  request_id uuid not null references public.maintenance_requests(id) on delete cascade,
  provider_id uuid references public.service_providers(id) on delete set null,
  assigned_to uuid references auth.users(id) on delete set null,   -- فني داخلي
  scheduled_at timestamptz,
  status public.maintenance_status not null default 'assigned',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_tasks_org on public.maintenance_tasks(organization_id);
create index idx_tasks_request on public.maintenance_tasks(request_id);
create trigger trg_task_updated before update on public.maintenance_tasks
  for each row execute function public.set_updated_at();

-- ---------- Maintenance costs ----------
create table public.maintenance_costs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  request_id uuid not null references public.maintenance_requests(id) on delete cascade,
  description text,
  amount numeric(12,2) not null default 0,
  invoice_ref text,
  created_at timestamptz not null default now()
);
create index idx_costs_request on public.maintenance_costs(request_id);

-- ---------- Notifications ----------
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  channel public.notification_channel not null default 'in_app',
  type text,
  title text,
  body text,
  data jsonb,
  status public.notification_status not null default 'pending',
  read_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);
create index idx_notifications_user on public.notifications(user_id);
create index idx_notifications_org on public.notifications(organization_id);

-- ---------- Subscriptions (per-unit pricing) ----------
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  tier public.subscription_tier not null default 'basic',
  unit_quota int not null default 20,
  units_used int not null default 0,
  price_per_unit numeric(10,2) not null default 0,
  billing_cycle public.billing_cycle not null default 'monthly',
  status public.subscription_status not null default 'trialing',
  current_period_start date,
  current_period_end date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_subscriptions_org on public.subscriptions(organization_id);
create trigger trg_subscription_updated before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- ---------- RLS ----------
alter table public.service_providers     enable row level security;
alter table public.maintenance_requests  enable row level security;
alter table public.maintenance_tasks     enable row level security;
alter table public.maintenance_costs     enable row level security;
alter table public.notifications         enable row level security;
alter table public.subscriptions         enable row level security;

-- service_providers
create policy providers_select on public.service_providers for select to authenticated
  using (public.has_permission(organization_id,'maintenance.read'));
create policy providers_write on public.service_providers for all to authenticated
  using (public.has_permission(organization_id,'maintenance.manage'))
  with check (public.has_permission(organization_id,'maintenance.manage'));

-- maintenance_requests: staff read/manage, tenant can view+create own
create policy requests_select on public.maintenance_requests for select to authenticated
  using (public.has_permission(organization_id,'maintenance.read')
         or exists (select 1 from public.tenants t where t.id = tenant_id and t.user_id = (select auth.uid())));
create policy requests_tenant_insert on public.maintenance_requests for insert to authenticated
  with check (public.has_permission(organization_id,'maintenance.manage')
              or (public.has_permission(organization_id,'maintenance.request')
                  and exists (select 1 from public.tenants t where t.id = tenant_id and t.user_id = (select auth.uid()))));
create policy requests_staff_update on public.maintenance_requests for update to authenticated
  using (public.has_permission(organization_id,'maintenance.manage'))
  with check (public.has_permission(organization_id,'maintenance.manage'));
create policy requests_staff_delete on public.maintenance_requests for delete to authenticated
  using (public.has_permission(organization_id,'maintenance.manage'));

-- maintenance_tasks
create policy tasks_select on public.maintenance_tasks for select to authenticated
  using (public.has_permission(organization_id,'maintenance.read'));
create policy tasks_write on public.maintenance_tasks for all to authenticated
  using (public.has_permission(organization_id,'maintenance.manage'))
  with check (public.has_permission(organization_id,'maintenance.manage'));

-- maintenance_costs
create policy costs_select on public.maintenance_costs for select to authenticated
  using (public.has_permission(organization_id,'maintenance.read'));
create policy costs_write on public.maintenance_costs for all to authenticated
  using (public.has_permission(organization_id,'maintenance.manage'))
  with check (public.has_permission(organization_id,'maintenance.manage'));

-- notifications: recipient sees own; recipient may mark read
create policy notifications_select on public.notifications for select to authenticated
  using (user_id = (select auth.uid()));
create policy notifications_update on public.notifications for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy notifications_insert on public.notifications for insert to authenticated
  with check (organization_id in (select public.user_org_ids()));

-- subscriptions: admins only
create policy subscriptions_select on public.subscriptions for select to authenticated
  using (public.is_org_admin(organization_id));
create policy subscriptions_write on public.subscriptions for all to authenticated
  using (public.is_org_admin(organization_id) and public.has_permission(organization_id,'settings.manage'))
  with check (public.is_org_admin(organization_id) and public.has_permission(organization_id,'settings.manage'));
