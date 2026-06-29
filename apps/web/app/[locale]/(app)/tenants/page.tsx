import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { UsersIcon, PlusIcon } from "@/components/ui/icons";
import {
  TenantsExplorer,
  type TenantItem,
} from "@/components/tenants/tenants-explorer";

export const dynamic = "force-dynamic";

export default async function TenantsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("tenants");

  const supabase = await createClient();
  const [{ data: tenants }, { data: leases }] = await Promise.all([
    supabase
      .from("tenants")
      .select("id, full_name, phone, email")
      .order("created_at", { ascending: false }),
    supabase.from("leases").select("tenant_id, status"),
  ]);

  const leaseCount = new Map<string, number>();
  const activeCount = new Map<string, number>();
  for (const l of leases ?? []) {
    leaseCount.set(l.tenant_id, (leaseCount.get(l.tenant_id) ?? 0) + 1);
    if (l.status === "active")
      activeCount.set(l.tenant_id, (activeCount.get(l.tenant_id) ?? 0) + 1);
  }

  const list: TenantItem[] = (tenants ?? []).map((x) => ({
    id: x.id,
    full_name: x.full_name,
    phone: x.phone,
    email: x.email,
    leaseCount: leaseCount.get(x.id) ?? 0,
    activeLeases: activeCount.get(x.id) ?? 0,
  }));

  const addButton = (label: string) => (
    <Link
      href="/tenants/new"
      className="inline-flex items-center gap-2 rounded-xl bg-brand-teal px-5 py-2.5 text-sm font-bold text-white shadow-card transition hover:bg-brand-teal-700"
    >
      <PlusIcon className="h-4 w-4" />
      {label}
    </Link>
  );

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        action={list.length > 0 ? addButton(t("add")) : null}
      />

      {list.length === 0 ? (
        <EmptyState
          icon={<UsersIcon className="h-7 w-7" />}
          title={t("emptyTitle")}
          body={t("emptyBody")}
          action={addButton(t("addFirst"))}
        />
      ) : (
        <TenantsExplorer tenants={list} locale={locale} />
      )}
    </div>
  );
}
