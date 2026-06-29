import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { WhatsAppIcon } from "@/components/ui/icons";

function waNumber(phone: string) {
  let d = phone.replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("0") && d.length === 10) d = "966" + d.slice(1);
  return d;
}

export async function PropertyReminders({
  propertyId,
  locale,
}: {
  propertyId: string;
  locale: string;
}) {
  const t = await getTranslations("properties");
  const supabase = await createClient();

  const { data: units } = await supabase.from("units").select("id").eq("property_id", propertyId);
  const unitIds = (units ?? []).map((u) => u.id);
  if (unitIds.length === 0) return null;

  const { data: leases } = await supabase
    .from("leases")
    .select("id, tenant_id")
    .in("unit_id", unitIds);
  const leaseIds = (leases ?? []).map((l) => l.id);
  const tenantByLease = new Map((leases ?? []).map((l) => [l.id, l.tenant_id]));
  if (leaseIds.length === 0) return null;

  const horizon = new Date();
  horizon.setDate(horizon.getDate() + 14);
  const horizonStr = horizon.toISOString().slice(0, 10);

  const { data: schedules } = await supabase
    .from("payment_schedules")
    .select("id, lease_id, amount, due_date, status")
    .in("lease_id", leaseIds)
    .eq("status", "pending")
    .lte("due_date", horizonStr)
    .order("due_date", { ascending: true });

  const { data: tenants } = await supabase
    .from("tenants")
    .select("id, full_name, phone")
    .in("id", Array.from(new Set((leases ?? []).map((l) => l.tenant_id))));
  const tenantById = new Map((tenants ?? []).map((x) => [x.id, x]));

  const fmt = (n: number) =>
    new Intl.NumberFormat("ar-SA-u-nu-latn", {
      style: "currency",
      currency: "SAR",
      maximumFractionDigits: 0,
    }).format(n);

  const rows = (schedules ?? []).map((s) => {
    const tenantId = tenantByLease.get(s.lease_id);
    const tenant = tenantId ? tenantById.get(tenantId) : undefined;
    return {
      id: s.id,
      name: tenant?.full_name ?? "—",
      phone: tenant?.phone ?? null,
      amount: s.amount,
      due_date: s.due_date,
    };
  });

  return (
    <div className="rounded-2xl border border-brand-teal/10 bg-white p-5 shadow-card">
      <h2 className="mb-4 text-base font-bold text-brand-teal-900">{t("remindersTitle")}</h2>
      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-brand-teal/20 bg-brand-cream/30 px-4 py-6 text-center text-sm text-brand-teal-900/55">
          {t("noReminders")}
        </p>
      ) : (
        <div className="space-y-2.5">
          {rows.map((r) => {
            const msg = t("reminderText", { amount: fmt(r.amount), date: r.due_date });
            const wa = r.phone
              ? `https://wa.me/${waNumber(r.phone)}?text=${encodeURIComponent(msg)}`
              : null;
            return (
              <div
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-teal/10 bg-brand-cream/20 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-brand-teal-900">{r.name}</p>
                  <p className="text-xs text-brand-teal-900/55" dir="ltr">
                    {fmt(r.amount)} · {r.due_date}
                  </p>
                </div>
                {wa ? (
                  <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-emerald-600"
                  >
                    <WhatsAppIcon className="h-4 w-4" />
                    {t("remindButton")}
                  </a>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
