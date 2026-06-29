import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { ArrowIcon } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

export default async function OwnerStatementPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("owners");
  const intlLocale = locale === "ar" ? "ar-SA-u-nu-latn" : "en-US";

  const supabase = await createClient();
  const { data: owner } = await supabase
    .from("owners")
    .select("id, full_name, commission_rate")
    .eq("id", id)
    .maybeSingle();

  if (!owner) notFound();

  // العقارات → الوحدات → العقود → الدفعات؛ وتكاليف الصيانة للوحدات.
  const { data: properties } = await supabase
    .from("properties")
    .select("id")
    .eq("owner_id", id);
  const propIds = (properties ?? []).map((p) => p.id);

  const { data: units } = propIds.length
    ? await supabase.from("units").select("id").in("property_id", propIds)
    : { data: [] };
  const unitIds = (units ?? []).map((u) => u.id);

  const { data: leases } = unitIds.length
    ? await supabase.from("leases").select("id").in("unit_id", unitIds)
    : { data: [] };
  const leaseIds = (leases ?? []).map((l) => l.id);

  const { data: schedules } = leaseIds.length
    ? await supabase
        .from("payment_schedules")
        .select("amount, status")
        .in("lease_id", leaseIds)
    : { data: [] };

  const { data: requests } = unitIds.length
    ? await supabase.from("maintenance_requests").select("id").in("unit_id", unitIds)
    : { data: [] };
  const reqIds = (requests ?? []).map((r) => r.id);

  const { data: costs } = reqIds.length
    ? await supabase.from("maintenance_costs").select("amount").in("request_id", reqIds)
    : { data: [] };

  const gross = (schedules ?? [])
    .filter((s) => s.status === "paid")
    .reduce((a, s) => a + s.amount, 0);
  const outstanding = (schedules ?? [])
    .filter((s) => s.status !== "paid" && s.status !== "waived")
    .reduce((a, s) => a + s.amount, 0);
  const expenses = (costs ?? []).reduce((a, c) => a + c.amount, 0);
  const commission = owner.commission_rate ?? 0;
  const mgmtFee = Math.round(gross * (commission / 100));
  const net = gross - expenses - mgmtFee;

  const fmt = (n: number) =>
    new Intl.NumberFormat(intlLocale, {
      style: "currency",
      currency: "SAR",
      maximumFractionDigits: 0,
    }).format(n);

  const hasData = gross > 0 || expenses > 0 || outstanding > 0;

  const rows = [
    { label: t("grossIncome"), value: gross, sign: "+" as const },
    { label: t("expenses"), value: -expenses, sign: "-" as const },
    {
      label: `${t("managementFee")} (${commission}%)`,
      value: -mgmtFee,
      sign: "-" as const,
    },
  ];

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href={`/owners/${id}`}
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-teal-900/60 transition hover:text-brand-teal-900"
      >
        <ArrowIcon className="h-4 w-4 rtl:rotate-180" />
        {owner.full_name}
      </Link>

      <div className="mb-7">
        <h1 className="text-2xl font-extrabold tracking-tight text-brand-teal-900 sm:text-[28px]">
          {t("statementTitle")}
        </h1>
        <p className="mt-1 text-sm text-brand-teal-900/55">
          {owner.full_name} · {t("statementSubtitle")}
        </p>
      </div>

      {!hasData ? (
        <p className="rounded-2xl border border-dashed border-brand-teal/20 bg-white/60 px-5 py-10 text-center text-sm text-brand-teal-900/55">
          {t("noFinance")}
        </p>
      ) : (
        <>
          {/* بطاقة صافي العائد */}
          <div className="mb-6 overflow-hidden rounded-3xl border border-brand-teal/15 bg-gradient-to-br from-brand-teal-900 to-brand-teal p-7 text-white shadow-card">
            <p className="text-sm font-medium text-white/70">{t("netPayout")}</p>
            <p className="mt-2 text-4xl font-extrabold tracking-tight" dir="ltr">
              {fmt(net)}
            </p>
          </div>

          {/* المؤشرات */}
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Mini label={t("grossIncome")} value={fmt(gross)} tone="green" />
            <Mini label={t("expenses")} value={fmt(expenses)} tone="amber" />
            <Mini label={t("outstandingLabel")} value={fmt(outstanding)} tone="teal" />
          </div>

          {/* التفاصيل */}
          <div className="overflow-hidden rounded-2xl border border-brand-teal/10 bg-white shadow-card">
            <div className="border-b border-brand-teal/8 px-5 py-3">
              <h2 className="text-sm font-bold text-brand-teal-900/70">{t("breakdownTitle")}</h2>
            </div>
            {rows.map((r, i) => (
              <div
                key={i}
                className={`flex items-center justify-between px-5 py-3.5 ${
                  i > 0 ? "border-t border-brand-teal/8" : ""
                }`}
              >
                <span className="text-sm text-brand-teal-900/70">{r.label}</span>
                <span
                  className={`text-sm font-bold ${
                    r.sign === "+" ? "text-emerald-600" : "text-rose-600"
                  }`}
                  dir="ltr"
                >
                  {r.sign}
                  {fmt(Math.abs(r.value))}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between border-t-2 border-brand-teal/15 bg-brand-teal/5 px-5 py-4">
              <span className="text-sm font-extrabold text-brand-teal-900">
                {t("netPayout")}
              </span>
              <span className="text-base font-extrabold text-brand-teal-900" dir="ltr">
                {fmt(net)}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Mini({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "green" | "amber" | "teal";
}) {
  const color =
    tone === "green"
      ? "text-emerald-600"
      : tone === "amber"
        ? "text-amber-600"
        : "text-brand-teal-900";
  return (
    <div className="rounded-2xl border border-brand-teal/10 bg-white p-4 shadow-card">
      <p className="text-xs font-medium text-brand-teal-900/50">{label}</p>
      <p className={`mt-1 text-lg font-extrabold ${color}`} dir="ltr">
        {value}
      </p>
    </div>
  );
}
