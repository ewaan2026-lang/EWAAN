import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Constants } from "@ewaan/db";

export const dynamic = "force-dynamic";

export default async function ReportsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("reports");
  const tus = await getTranslations("unitStatus");
  const tls = await getTranslations("leaseStatus");
  const intlLocale = locale === "ar" ? "ar-SA-u-nu-latn" : "en-US";

  const supabase = await createClient();
  const [{ data: schedules }, { data: payments }, { data: units }, { data: leases }, { data: deposits }] =
    await Promise.all([
      supabase.from("payment_schedules").select("amount, status, due_date"),
      supabase.from("payments").select("amount, paid_at, status"),
      supabase.from("units").select("status"),
      supabase.from("leases").select("status"),
      supabase.from("deposits").select("amount, status"),
    ]);

  const fmt = (n: number) =>
    new Intl.NumberFormat(intlLocale, {
      style: "currency",
      currency: "SAR",
      maximumFractionDigits: 0,
    }).format(n);

  const sched = schedules ?? [];
  const collected = sched.filter((s) => s.status === "paid").reduce((a, s) => a + s.amount, 0);
  const outstanding = sched
    .filter((s) => s.status !== "paid" && s.status !== "waived")
    .reduce((a, s) => a + s.amount, 0);

  const now = new Date();
  const thisYear = String(now.getFullYear());
  const expectedAnnual = sched
    .filter((s) => s.due_date.slice(0, 4) === thisYear)
    .reduce((a, s) => a + s.amount, 0);

  const unitList = units ?? [];
  const totalUnits = unitList.length;
  const occupied = unitList.filter((u) => u.status === "occupied").length;
  const occupancy = totalUnits > 0 ? Math.round((occupied / totalUnits) * 100) : 0;

  const activeLeases = (leases ?? []).filter((l) => l.status === "active").length;
  const depositsHeld = (deposits ?? [])
    .filter((d) => d.status === "held")
    .reduce((a, d) => a + d.amount, 0);

  // الإيراد المُحصّل لكل شهر (آخر 6 أشهر)
  const months: { key: string; label: string; total: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const dt = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`,
      label: new Intl.DateTimeFormat(intlLocale, { month: "short" }).format(dt),
      total: 0,
    });
  }
  for (const p of payments ?? []) {
    if (p.status !== "completed" || !p.paid_at) continue;
    const key = p.paid_at.slice(0, 7);
    const m = months.find((x) => x.key === key);
    if (m) m.total += p.amount;
  }
  const maxMonth = Math.max(1, ...months.map((m) => m.total));

  // الوحدات حسب الحالة
  const unitStatuses = Constants.public.Enums.unit_status;
  const unitCounts = unitStatuses.map((s) => ({
    status: s,
    label: tus(s),
    count: unitList.filter((u) => u.status === s).length,
  }));
  const maxUnit = Math.max(1, ...unitCounts.map((u) => u.count));

  // العقود حسب الحالة
  const leaseStatuses = Constants.public.Enums.lease_status;
  const leaseCounts = leaseStatuses
    .map((s) => ({
      status: s,
      label: tls(s),
      count: (leases ?? []).filter((l) => l.status === s).length,
    }))
    .filter((x) => x.count > 0);

  const kpis = [
    { label: t("kpi.collected"), value: fmt(collected), tone: "green" as const },
    { label: t("kpi.outstanding"), value: fmt(outstanding), tone: "amber" as const },
    { label: t("kpi.expectedAnnual"), value: fmt(expectedAnnual), tone: "teal" as const },
    { label: t("kpi.occupancy"), value: `${occupancy}%`, tone: "teal" as const },
    { label: t("kpi.activeLeases"), value: String(activeLeases), tone: "teal" as const },
    { label: t("kpi.depositsHeld"), value: fmt(depositsHeld), tone: "teal" as const },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      {/* مؤشرات */}
      <div className="stagger mb-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
        {kpis.map((k, i) => (
          <div key={i} className="rounded-2xl border border-brand-teal/10 bg-white p-5 shadow-card">
            <p className="text-xs font-medium text-brand-teal-900/50">{k.label}</p>
            <p
              className={`mt-1.5 text-2xl font-extrabold ${
                k.tone === "green"
                  ? "text-emerald-600"
                  : k.tone === "amber"
                    ? "text-amber-600"
                    : "text-brand-teal-900"
              }`}
              dir="ltr"
            >
              {k.value}
            </p>
          </div>
        ))}
      </div>

      {/* الإيراد الشهري */}
      <div className="mb-8 rounded-3xl border border-brand-teal/10 bg-white p-6 shadow-card">
        <h2 className="mb-5 text-base font-bold text-brand-teal-900">{t("revenueTitle")}</h2>
        <div className="flex items-end justify-between gap-3" style={{ height: "180px" }}>
          {months.map((m, i) => (
            <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
              <span className="text-[11px] font-bold text-brand-teal-900/60" dir="ltr">
                {m.total > 0 ? Math.round(m.total / 1000) + "k" : ""}
              </span>
              <div
                className="w-full max-w-[44px] rounded-t-lg bg-gradient-to-t from-brand-teal to-brand-teal-700 transition-all"
                style={{ height: `${Math.max(2, (m.total / maxMonth) * 100)}%` }}
              />
              <span className="text-[11px] font-medium text-brand-teal-900/50">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* الوحدات حسب الحالة */}
        <div className="rounded-3xl border border-brand-teal/10 bg-white p-6 shadow-card">
          <h2 className="mb-5 text-base font-bold text-brand-teal-900">{t("unitsByStatusTitle")}</h2>
          <div className="space-y-3">
            {unitCounts.map((u) => (
              <BarRow key={u.status} label={u.label} count={u.count} pct={(u.count / maxUnit) * 100} />
            ))}
          </div>
        </div>

        {/* العقود حسب الحالة */}
        <div className="rounded-3xl border border-brand-teal/10 bg-white p-6 shadow-card">
          <h2 className="mb-5 text-base font-bold text-brand-teal-900">{t("leasesByStatusTitle")}</h2>
          {leaseCounts.length === 0 ? (
            <p className="text-sm text-brand-teal-900/50">{t("noData")}</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {leaseCounts.map((l) => (
                <div
                  key={l.status}
                  className="flex min-w-[90px] flex-col items-center rounded-2xl bg-brand-teal/5 px-4 py-3"
                >
                  <span className="text-2xl font-extrabold text-brand-teal-900">{l.count}</span>
                  <span className="mt-0.5 text-xs font-medium text-brand-teal-900/55">{l.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BarRow({ label, count, pct }: { label: string; count: number; pct: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 shrink-0 text-sm font-medium text-brand-teal-900/70">{label}</span>
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-brand-teal/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-teal to-brand-teal-700"
          style={{ width: `${Math.max(count > 0 ? 6 : 0, pct)}%` }}
        />
      </div>
      <span className="w-8 shrink-0 text-end text-sm font-bold text-brand-teal-900">{count}</span>
    </div>
  );
}
