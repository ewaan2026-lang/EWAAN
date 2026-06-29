import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import {
  LeaseStatusBadge,
  ScheduleStatusBadge,
} from "@/components/leases/status-badge";
import {
  PriorityBadge,
  MaintenanceStatusBadge,
} from "@/components/maintenance/badges";
import { TenantRequestForm } from "@/components/portal/request-form";
import { PayButton } from "@/components/portal/pay-button";
import { EmptyState } from "@/components/ui/empty-state";
import { UsersIcon } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

export default async function PortalPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("portal");
  const intlLocale = locale === "ar" ? "ar-SA-u-nu-latn" : "en-US";

  const supabase = await createClient();
  const { data: tenants } = await supabase
    .from("tenants")
    .select("id, full_name, organization_id")
    .limit(1);
  const tenant = (tenants ?? [])[0];

  if (!tenant) {
    return (
      <EmptyState
        icon={<UsersIcon className="h-7 w-7" />}
        title={t("notTenantTitle")}
        body={t("notTenantBody")}
      />
    );
  }

  const { data: leases } = await supabase
    .from("leases")
    .select("id, contract_number, status, start_date, end_date, rent_amount, unit_id, organization_id")
    .eq("tenant_id", tenant.id)
    .order("start_date", { ascending: false });
  const leaseList = leases ?? [];
  const leaseIds = leaseList.map((l) => l.id);

  const { data: schedules } = leaseIds.length
    ? await supabase
        .from("payment_schedules")
        .select("id, due_date, amount, status, sequence")
        .in("lease_id", leaseIds)
        .order("due_date", { ascending: true })
    : { data: [] };

  const { data: requests } = await supabase
    .from("maintenance_requests")
    .select("id, title, status, priority, created_at")
    .eq("tenant_id", tenant.id)
    .order("created_at", { ascending: false });

  const fmt = (n: number) =>
    new Intl.NumberFormat(intlLocale, {
      style: "currency",
      currency: "SAR",
      maximumFractionDigits: 0,
    }).format(n);

  const primary = leaseList[0];
  const payEnabled = process.env.NEXT_PUBLIC_MOYASAR_ENABLED === "1";

  return (
    <div className="space-y-8">
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-night via-brand-ink to-brand-teal-900 p-7 text-white shadow-luxe sm:p-8">
        <span className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-brand-gold to-transparent opacity-70" />
        <div className="float-slow pointer-events-none absolute -end-20 -top-24 h-64 w-64 rounded-full bg-brand-gold/15 blur-3xl" />
        <div className="relative">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-brand-gold">
            {t("portalLabel")}
          </p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
            {t("welcome", { name: tenant.full_name })}
          </h1>
          <div className="mt-4 h-px w-24 bg-gradient-to-r from-brand-gold to-transparent" />
        </div>
      </header>

      {/* عقودي */}
      <section>
        <h2 className="mb-3 text-lg font-bold text-brand-teal-900">{t("leasesTitle")}</h2>
        {leaseList.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-brand-teal/20 bg-white/60 px-5 py-8 text-center text-sm text-brand-teal-900/55">
            {t("noLeases")}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {leaseList.map((l) => (
              <div key={l.id} className="rounded-2xl border border-brand-teal/10 bg-white p-5 shadow-card">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[15px] font-extrabold text-brand-teal-900" dir="ltr">
                    {l.contract_number ?? `#${l.id.slice(0, 8)}`}
                  </p>
                  <LeaseStatusBadge status={l.status} />
                </div>
                <p className="mt-2 text-xs text-brand-teal-900/50" dir="ltr">
                  {l.start_date} → {l.end_date}
                </p>
                <p className="mt-2 text-sm font-bold text-brand-teal-900" dir="ltr">
                  {fmt(l.rent_amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* جدول الدفعات */}
      {(schedules ?? []).length > 0 ? (
        <section>
          <h2 className="mb-3 text-lg font-bold text-brand-teal-900">{t("paymentsTitle")}</h2>
          <div className="overflow-hidden rounded-2xl border border-brand-teal/10 bg-white shadow-card">
            {(schedules ?? []).map((s, i) => (
              <div
                key={s.id}
                className={`flex items-center justify-between gap-3 px-5 py-3.5 ${
                  i > 0 ? "border-t border-brand-teal/8" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-teal/8 text-xs font-bold text-brand-teal">
                    {s.sequence}
                  </span>
                  <span className="text-sm text-brand-teal-900/70" dir="ltr">
                    {s.due_date}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-brand-teal-900" dir="ltr">
                    {fmt(s.amount)}
                  </span>
                  <ScheduleStatusBadge status={s.status} />
                  {payEnabled && s.status !== "paid" && s.status !== "waived" ? (
                    <PayButton scheduleId={s.id} />
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* الصيانة */}
      <section>
        <h2 className="mb-3 text-lg font-bold text-brand-teal-900">{t("requestsTitle")}</h2>

        {primary ? (
          <div className="mb-5 rounded-2xl border border-brand-teal/15 bg-white p-5 shadow-card">
            <h3 className="mb-4 text-base font-bold text-brand-teal-900">{t("newRequestTitle")}</h3>
            <TenantRequestForm
              organizationId={primary.organization_id}
              unitId={primary.unit_id}
              tenantId={tenant.id}
              leaseId={primary.id}
            />
          </div>
        ) : null}

        {(requests ?? []).length === 0 ? (
          <p className="rounded-2xl border border-dashed border-brand-teal/20 bg-white/60 px-5 py-8 text-center text-sm text-brand-teal-900/55">
            {t("noRequests")}
          </p>
        ) : (
          <div className="space-y-3">
            {(requests ?? []).map((r) => (
              <div
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-teal/10 bg-white p-4 shadow-card"
              >
                <p className="text-sm font-bold text-brand-teal-900">{r.title}</p>
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={r.priority} />
                  <MaintenanceStatusBadge status={r.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
