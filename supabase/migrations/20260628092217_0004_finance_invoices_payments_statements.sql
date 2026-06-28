
-- =====================================================================
-- EWAAN — المالية: الفواتير + المدفوعات + التأمين + الدفتر + كشوف الملّاك
-- =====================================================================

create type public.invoice_type as enum ('rent','management_fee','service','deposit','other');
create type public.invoice_status as enum ('draft','issued','paid','partially_paid','overdue','cancelled');
create type public.payment_method as enum ('mada','card','apple_pay','bank_transfer','sadad','cash');
create type public.payment_status as enum ('pending','completed','failed','refunded');
create type public.deposit_status as enum ('held','partially_refunded','refunded','forfeited');
create type public.ledger_type as enum ('income','expense');
create type public.statement_status as enum ('draft','finalized','paid');

-- ---------- Invoices ----------
create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  lease_id uuid references public.leases(id) on delete set null,
  tenant_id uuid references public.tenants(id) on delete set null,
  schedule_id uuid references public.payment_schedules(id) on delete set null,
  invoice_number text not null,
  type public.invoice_type not null default 'rent',
  issue_date date not null default current_date,
  due_date date,
  currency text not null default 'SAR',
  subtotal numeric(12,2) not null default 0,
  tax_amount numeric(12,2) not null default 0,   -- 15% فقط على الأتعاب/الخدمات الخاضعة
  total numeric(12,2) not null default 0,
  status public.invoice_status not null default 'draft',
  -- حقول متوافقة بنيوياً مع «فاتورة» ZATCA (تُفعّل لاحقاً)
  zatca_uuid uuid,
  zatca_hash text,
  zatca_qr text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, invoice_number)
);
create index idx_invoices_org on public.invoices(organization_id);
create index idx_invoices_lease on public.invoices(lease_id);
create index idx_invoices_status on public.invoices(status);
create trigger trg_invoice_updated before update on public.invoices
  for each row execute function public.set_updated_at();

create table public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  description text not null,
  quantity numeric(12,2) not null default 1,
  unit_price numeric(12,2) not null default 0,
  is_taxable boolean not null default false,      -- الإيجار السكني = false ، الأتعاب = true
  tax_rate numeric(5,2) not null default 0,        -- 15 عند الخضوع
  line_total numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);
create index idx_invoice_items_invoice on public.invoice_items(invoice_id);

-- ---------- Payments ----------
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  invoice_id uuid references public.invoices(id) on delete set null,
  lease_id uuid references public.leases(id) on delete set null,
  tenant_id uuid references public.tenants(id) on delete set null,
  amount numeric(12,2) not null,
  method public.payment_method,
  status public.payment_status not null default 'pending',
  gateway text,                 -- moyasar | hyperpay
  gateway_ref text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_payments_org on public.payments(organization_id);
create index idx_payments_invoice on public.payments(invoice_id);
create index idx_payments_status on public.payments(status);
create trigger trg_payment_updated before update on public.payments
  for each row execute function public.set_updated_at();

-- ---------- Deposits (تسجيل المبلغ فقط) ----------
create table public.deposits (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  lease_id uuid not null references public.leases(id) on delete cascade,
  amount numeric(12,2) not null,
  status public.deposit_status not null default 'held',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_deposits_org on public.deposits(organization_id);
create index idx_deposits_lease on public.deposits(lease_id);
create trigger trg_deposit_updated before update on public.deposits
  for each row execute function public.set_updated_at();

-- ---------- Simplified ledger ----------
create table public.ledger_entries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  entry_date date not null default current_date,
  type public.ledger_type not null,
  category text,
  amount numeric(12,2) not null,
  property_id uuid references public.properties(id) on delete set null,
  unit_id uuid references public.units(id) on delete set null,
  owner_id uuid references public.owners(id) on delete set null,
  lease_id uuid references public.leases(id) on delete set null,
  reference text,
  description text,
  created_at timestamptz not null default now()
);
create index idx_ledger_org on public.ledger_entries(organization_id);
create index idx_ledger_owner on public.ledger_entries(owner_id);
create index idx_ledger_date on public.ledger_entries(entry_date);

-- ---------- Owner statements ----------
create table public.owner_statements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  owner_id uuid not null references public.owners(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  gross_income numeric(12,2) not null default 0,
  total_expenses numeric(12,2) not null default 0,
  management_fee numeric(12,2) not null default 0,
  net_payout numeric(12,2) not null default 0,
  status public.statement_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_statements_org on public.owner_statements(organization_id);
create index idx_statements_owner on public.owner_statements(owner_id);
create trigger trg_statement_updated before update on public.owner_statements
  for each row execute function public.set_updated_at();

create table public.owner_statement_lines (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  statement_id uuid not null references public.owner_statements(id) on delete cascade,
  description text not null,
  kind public.ledger_type not null,        -- income | expense
  amount numeric(12,2) not null,
  created_at timestamptz not null default now()
);
create index idx_statement_lines_stmt on public.owner_statement_lines(statement_id);

-- ---------- Helper: is current user this owner ----------
create or replace function public.is_owner_self(p_owner uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.owners o
    where o.id = p_owner and o.user_id = (select auth.uid())
  );
$$;

-- ---------- RLS ----------
alter table public.invoices              enable row level security;
alter table public.invoice_items         enable row level security;
alter table public.payments              enable row level security;
alter table public.deposits              enable row level security;
alter table public.ledger_entries        enable row level security;
alter table public.owner_statements      enable row level security;
alter table public.owner_statement_lines enable row level security;

-- invoices: finance staff or the tenant on the invoice
create policy invoices_select on public.invoices for select to authenticated
  using (public.has_permission(organization_id,'invoices.read')
         or exists (select 1 from public.tenants t where t.id = tenant_id and t.user_id = (select auth.uid())));
create policy invoices_write on public.invoices for all to authenticated
  using (public.has_permission(organization_id,'invoices.manage'))
  with check (public.has_permission(organization_id,'invoices.manage'));

-- invoice_items
create policy invoice_items_select on public.invoice_items for select to authenticated
  using (exists (select 1 from public.invoices i where i.id = invoice_id
                 and (public.has_permission(i.organization_id,'invoices.read')
                      or exists (select 1 from public.tenants t where t.id = i.tenant_id and t.user_id = (select auth.uid())))));
create policy invoice_items_write on public.invoice_items for all to authenticated
  using (public.has_permission(organization_id,'invoices.manage'))
  with check (public.has_permission(organization_id,'invoices.manage'));

-- payments: finance staff or the tenant
create policy payments_select on public.payments for select to authenticated
  using (public.has_permission(organization_id,'payments.read')
         or exists (select 1 from public.tenants t where t.id = tenant_id and t.user_id = (select auth.uid())));
create policy payments_write on public.payments for all to authenticated
  using (public.has_permission(organization_id,'payments.manage'))
  with check (public.has_permission(organization_id,'payments.manage'));

-- deposits
create policy deposits_select on public.deposits for select to authenticated
  using (public.has_permission(organization_id,'payments.read') or public.is_lease_tenant(lease_id));
create policy deposits_write on public.deposits for all to authenticated
  using (public.has_permission(organization_id,'payments.manage'))
  with check (public.has_permission(organization_id,'payments.manage'));

-- ledger_entries: finance staff only
create policy ledger_select on public.ledger_entries for select to authenticated
  using (public.has_permission(organization_id,'reports.read') or public.has_permission(organization_id,'payments.read'));
create policy ledger_write on public.ledger_entries for all to authenticated
  using (public.has_permission(organization_id,'payments.manage'))
  with check (public.has_permission(organization_id,'payments.manage'));

-- owner_statements: finance staff or the owner themselves
create policy statements_select on public.owner_statements for select to authenticated
  using (public.has_permission(organization_id,'owner_statements.read') or public.is_owner_self(owner_id));
create policy statements_write on public.owner_statements for all to authenticated
  using (public.has_permission(organization_id,'payments.manage'))
  with check (public.has_permission(organization_id,'payments.manage'));

-- owner_statement_lines
create policy statement_lines_select on public.owner_statement_lines for select to authenticated
  using (exists (select 1 from public.owner_statements s where s.id = statement_id
                 and (public.has_permission(s.organization_id,'owner_statements.read') or public.is_owner_self(s.owner_id))));
create policy statement_lines_write on public.owner_statement_lines for all to authenticated
  using (public.has_permission(organization_id,'payments.manage'))
  with check (public.has_permission(organization_id,'payments.manage'));
