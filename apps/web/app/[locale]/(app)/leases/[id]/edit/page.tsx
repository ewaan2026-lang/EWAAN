import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  LeaseForm,
  type UnitOption,
  type TenantOption,
  type LeaseInitial,
} from "@/components/leases/lease-form";
import { ArrowIcon } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

export default async function EditLeasePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("leases");
  const tc = await getTranslations("common");

  const supabase = await createClient();
  const { data: lease } = await supabase
    .from("leases")
    .select(
      "id, unit_id, tenant_id, contract_number, start_date, end_date, rent_amount, payment_frequency, deposit_amount, late_fee_type, late_fee_value, grace_period_days, auto_renew, status",
    )
    .eq("id", id)
    .maybeSingle();

  if (!lease) notFound();

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

  const initial: LeaseInitial = {
    id: lease.id,
    unit_id: lease.unit_id,
    tenant_id: lease.tenant_id,
    contract_number: lease.contract_number ?? "",
    start_date: lease.start_date,
    end_date: lease.end_date,
    rent_amount: lease.rent_amount,
    payment_frequency: lease.payment_frequency,
    deposit_amount: lease.deposit_amount,
    late_fee_type: lease.late_fee_type,
    late_fee_value: lease.late_fee_value,
    grace_period_days: lease.grace_period_days,
    auto_renew: lease.auto_renew,
    status: lease.status,
  };

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href={`/leases/${id}`}
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-teal-900/60 transition hover:text-brand-teal-900"
      >
        <ArrowIcon className="h-4 w-4 rtl:rotate-180" />
        {tc("back")}
      </Link>

      <div className="overflow-hidden rounded-3xl border border-brand-teal/10 bg-white shadow-card">
        <div className="border-b border-brand-teal/8 bg-gradient-to-l from-brand-teal/5 to-transparent px-7 py-6">
          <h1 className="text-xl font-extrabold text-brand-teal-900">{t("editTitle")}</h1>
          <p className="mt-1 text-sm text-brand-teal-900/55">{t("editNote")}</p>
        </div>
        <div className="px-7 py-7">
          <LeaseForm units={unitOptions} tenants={tenantOptions} initial={initial} />
        </div>
      </div>
    </div>
  );
}
