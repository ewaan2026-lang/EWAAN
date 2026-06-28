
-- =====================================================================
-- EWAAN — الهيكل الهرمي للعقارات
-- Portfolio -> Owner -> Property -> Unit (+ meters, media, documents)
-- =====================================================================

create type public.property_type as enum
  ('residential_building','villa','floor','studio','apartment','compound','tower','other');
create type public.unit_status as enum
  ('vacant','occupied','reserved','maintenance','unavailable');
create type public.meter_type as enum ('electricity','water');
create type public.media_kind as enum ('image','floor_plan','video','document');

-- ---------- Portfolios ----------
create table public.portfolios (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_portfolios_org on public.portfolios(organization_id);
create trigger trg_portfolio_updated before update on public.portfolios
  for each row execute function public.set_updated_at();

-- ---------- Owners ----------
create table public.owners (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  portfolio_id uuid references public.portfolios(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,  -- ربط حساب المالك (بوابة المالك)
  full_name text not null,
  national_id text,
  email text,
  phone text,
  iban text,                          -- لصرف العائد
  commission_rate numeric(5,2) default 0,   -- نسبة أتعاب الإدارة %
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_owners_org on public.owners(organization_id);
create index idx_owners_portfolio on public.owners(portfolio_id);
create trigger trg_owner_updated before update on public.owners
  for each row execute function public.set_updated_at();

-- ---------- Properties ----------
create table public.properties (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  portfolio_id uuid references public.portfolios(id) on delete set null,
  owner_id uuid references public.owners(id) on delete set null,
  name text not null,
  property_type public.property_type not null default 'residential_building',
  address jsonb,
  national_address text,              -- العنوان الوطني (يدوي مبدئياً)
  deed_number text,                   -- رقم الصك (يدوي مبدئياً)
  latitude numeric(9,6),
  longitude numeric(9,6),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_properties_org on public.properties(organization_id);
create index idx_properties_owner on public.properties(owner_id);
create trigger trg_property_updated before update on public.properties
  for each row execute function public.set_updated_at();

-- ---------- Unit Types (قابلة للتخصيص بالكامل) ----------
create table public.unit_types (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_unit_types_org on public.unit_types(organization_id);
create trigger trg_unit_type_updated before update on public.unit_types
  for each row execute function public.set_updated_at();

-- ---------- Units ----------
create table public.units (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  unit_type_id uuid references public.unit_types(id) on delete set null,
  unit_number text not null,
  floor int,
  area_sqm numeric(10,2),
  bedrooms int,
  bathrooms int,
  furnished boolean not null default false,
  status public.unit_status not null default 'vacant',
  base_rent numeric(12,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_units_org on public.units(organization_id);
create index idx_units_property on public.units(property_id);
create index idx_units_status on public.units(status);
create trigger trg_unit_updated before update on public.units
  for each row execute function public.set_updated_at();

-- ---------- Meters + Readings ----------
create table public.meters (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  unit_id uuid not null references public.units(id) on delete cascade,
  type public.meter_type not null,
  meter_number text,
  created_at timestamptz not null default now()
);
create index idx_meters_org on public.meters(organization_id);
create index idx_meters_unit on public.meters(unit_id);

create table public.meter_readings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  meter_id uuid not null references public.meters(id) on delete cascade,
  reading numeric(14,2) not null,
  reading_date date not null default current_date,
  created_at timestamptz not null default now()
);
create index idx_readings_org on public.meter_readings(organization_id);
create index idx_readings_meter on public.meter_readings(meter_id);

-- ---------- Media + Documents (polymorphic) ----------
create table public.media (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  entity_type text not null,          -- 'unit' | 'property' | 'maintenance_request' ...
  entity_id uuid not null,
  kind public.media_kind not null default 'image',
  storage_path text not null,
  caption text,
  created_at timestamptz not null default now()
);
create index idx_media_org on public.media(organization_id);
create index idx_media_entity on public.media(entity_type, entity_id);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  entity_type text not null,
  entity_id uuid not null,
  name text not null,
  doc_type text,                      -- 'deed' | 'contract' | 'id' ...
  storage_path text not null,
  created_at timestamptz not null default now()
);
create index idx_documents_org on public.documents(organization_id);
create index idx_documents_entity on public.documents(entity_type, entity_id);

-- ---------- RLS ----------
alter table public.portfolios     enable row level security;
alter table public.owners         enable row level security;
alter table public.properties     enable row level security;
alter table public.unit_types     enable row level security;
alter table public.units          enable row level security;
alter table public.meters         enable row level security;
alter table public.meter_readings enable row level security;
alter table public.media          enable row level security;
alter table public.documents      enable row level security;

-- portfolios
create policy portfolios_select on public.portfolios for select to authenticated
  using (public.is_org_member(organization_id));
create policy portfolios_write on public.portfolios for all to authenticated
  using (public.has_permission(organization_id,'properties.write'))
  with check (public.has_permission(organization_id,'properties.write'));

-- owners
create policy owners_select on public.owners for select to authenticated
  using (public.has_permission(organization_id,'owners.read'));
create policy owners_write on public.owners for all to authenticated
  using (public.has_permission(organization_id,'owners.write'))
  with check (public.has_permission(organization_id,'owners.write'));

-- properties
create policy properties_select on public.properties for select to authenticated
  using (public.has_permission(organization_id,'properties.read'));
create policy properties_write on public.properties for all to authenticated
  using (public.has_permission(organization_id,'properties.write'))
  with check (public.has_permission(organization_id,'properties.write'));

-- unit_types
create policy unit_types_select on public.unit_types for select to authenticated
  using (public.is_org_member(organization_id));
create policy unit_types_write on public.unit_types for all to authenticated
  using (public.has_permission(organization_id,'units.write'))
  with check (public.has_permission(organization_id,'units.write'));

-- units
create policy units_select on public.units for select to authenticated
  using (public.has_permission(organization_id,'units.read'));
create policy units_write on public.units for all to authenticated
  using (public.has_permission(organization_id,'units.write'))
  with check (public.has_permission(organization_id,'units.write'));

-- meters
create policy meters_select on public.meters for select to authenticated
  using (public.has_permission(organization_id,'units.read'));
create policy meters_write on public.meters for all to authenticated
  using (public.has_permission(organization_id,'units.write'))
  with check (public.has_permission(organization_id,'units.write'));

-- meter_readings
create policy readings_select on public.meter_readings for select to authenticated
  using (public.has_permission(organization_id,'units.read'));
create policy readings_write on public.meter_readings for all to authenticated
  using (public.has_permission(organization_id,'units.write'))
  with check (public.has_permission(organization_id,'units.write'));

-- media
create policy media_select on public.media for select to authenticated
  using (public.is_org_member(organization_id));
create policy media_write on public.media for all to authenticated
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

-- documents
create policy documents_select on public.documents for select to authenticated
  using (public.is_org_member(organization_id));
create policy documents_write on public.documents for all to authenticated
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));
