import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { LayersIcon, PlusIcon } from "@/components/ui/icons";
import { LeaseCard, type LeaseCardData } from "@/components/leases/lease-card";

export const dynamic = "force-dynamic";

export default async function LeasesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("leases");

  const supabase = await createClient();

  const [{ data: leases }, { data: tenants }, { data: units }, { data: properties }] =
    await Promise.all([
      supabase
        .from("leases")
        .select("id, contract_number, status, rent_amount, start_date, end_date, unit_id, tenant_id")
        .order("start_date", { ascending: false }),
      supabase.from("tenants").select("id, full_name"),
      supabase.from("units").select("id, unit_number, property_id"),
      supabase.from("properties").select("id, name"),
    ]);

  const tenantName = new Map((tenants ?? []).map((x) => [x.id, x.full_name]));
  const propertyName = new Map((properties ?? []).map((x) => [x.id, x.name]));
  const unitLabel = new Map(
    (units ?? []).map((u) => {
      const pn = u.property_id ? propertyName.get(u.property_id) : null;
      return [u.id, pn ? `${pn} — ${u.unit_number}` : u.unit_number];
    }),
  );

  const list: LeaseCardData[] = (leases ?? []).map((l) => ({
    id: l.id,
    contract_number: l.contract_number,
    status: l.status,
    rent_amount: l.rent_amount,
    start_date: l.start_date,
    end_date: l.end_date,
    unitLabel: unitLabel.get(l.unit_id) ?? "—",
    tenantName: tenantName.get(l.tenant_id) ?? "—",
  }));

  const addButton = (label: string) => (
    <Link
      href="/leases/new"
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
          icon={<LayersIcon className="h-7 w-7" />}
          title={t("emptyTitle")}
          body={t("emptyBody")}
          action={addButton(t("addFirst"))}
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((l) => (
            <LeaseCard key={l.id} lease={l} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}
