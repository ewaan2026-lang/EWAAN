-- سجلّ النشاط: من فعل ماذا ومتى داخل المؤسسة.
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  actor_id uuid,
  actor_email text,
  action text not null,
  entity_type text,
  entity_id uuid,
  summary text,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_org_created_idx
  on public.audit_logs (organization_id, created_at desc);

alter table public.audit_logs enable row level security;

create policy audit_logs_select on public.audit_logs
  for select using (public.is_org_member(organization_id));

create policy audit_logs_insert on public.audit_logs
  for insert with check (public.is_org_member(organization_id));
