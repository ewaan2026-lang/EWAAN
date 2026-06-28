import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/empty-state";
import { ArrowIcon, LayersIcon } from "@/components/ui/icons";
import {
  LeaseForm,
  type UnitOption,
  type TenantOption,
} from "@/components/leases/lease-form";

export const dynamic = "force-dynamic";

export default async function NewLeasePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("leases");
  const tc = await getTranslations("common");

  const supabase = await createClient();
  const [{ data: units }, { data: properties }, { data: tenants }] =
    await Promise.all([
      supabase.from("units").select("id, unit_number, property_id").order("unit_number"),
      supabase.from("properties").select("id, name"),
      supabase.from("tenants").select("id, full_name").order("full_name"),
    ]);

  const propertyName = new Map((properties ?? []).map((p) => [p.id, p.name]));
  const unitOptions: UnitOption[] = (units ?? []).map((u) => {
    const pn = u.property_id ? propertyName.get(u.property_id) : null;
    return { id: u.id, label: pn ? `${pn} — ${u.unit_number}` : u.unit_number };
  });
  const tenantOptions: TenantOption[] = (tenants ?? []).map((tn) => ({
    id: tn.id,
    full_name: tn.full_name,
  }));

  const ready = unitOptions.length > 0 && tenantOptions.length > 0;

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/leases"
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-teal-900/60 transition hover:text-brand-teal-900"
      >
        <ArrowIcon className="h-4 w-4 rtl:rotate-180" />
        {tc("back")}
      </Link>

      {!ready ? (
        <EmptyState
          icon={<LayersIcon className="h-7 w-7" />}
          title={t("needUnitsTitle")}
          body={t("needUnitsBody")}
        />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-brand-teal/10 bg-white shadow-card">
          <div className="border-b border-brand-teal/8 bg-gradient-to-l from-brand-teal/5 to-transparent px-7 py-6">
            <h1 className="text-xl font-extrabold text-brand-teal-900">
              {t("newTitle")}
            </h1>
            <p className="mt-1 text-sm text-brand-teal-900/55">{t("newSubtitle")}</p>
          </div>
          <div className="px-7 py-7">
            <LeaseForm units={unitOptions} tenants={tenantOptions} />
          </div>
        </div>
      )}
    </div>
  );
}
