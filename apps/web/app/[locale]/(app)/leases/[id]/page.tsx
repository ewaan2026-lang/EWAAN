import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  LeaseStatusBadge,
  ScheduleStatusBadge,
} from "@/components/leases/status-badge";
import { DeleteButton } from "@/components/ui/delete-button";
import {
  deleteLeaseAction,
  terminateLeaseAction,
} from "@/lib/actions/leases";
import { ArrowIcon, PencilIcon } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

export default async function LeaseDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("leases");
  const tlabels = await getTranslations("leases.labels");
  const tf = await getTranslations("paymentFrequency");
  const tlt = await getTranslations("lateFeeType");
  const tc = await getTranslations("common");

  const supabase = await createClient();

  const { data: lease } = await supabase
    .from("leases")
    .select(
      "id, contract_number, status, rent_amount, payment_frequency, deposit_amount, late_fee_type, late_fee_value, grace_period_days, auto_renew, start_date, end_date, unit_id, tenant_id",
    )
    .eq("id", id)
    .maybeSingle();

  if (!lease) notFound();

  const [{ data: tenant }, { data: unit }, { data: schedules }] = await Promise.all([
    supabase.from("tenants").select("id, full_name").eq("id", lease.tenant_id).maybeSingle(),
    supabase.from("units").select("id, unit_number, property_id").eq("id", lease.unit_id).maybeSingle(),
    supabase
      .from("payment_schedules")
      .select("id, sequence, due_date, amount, status")
      .eq("lease_id", id)
      .order("sequence", { ascending: true }),
  ]);

  let property: { id: string; name: string } | null = null;
  if (unit?.property_id) {
    const { data } = await supabase
      .from("properties")
      .select("id, name")
      .eq("id", unit.property_id)
      .maybeSingle();
    property = data;
  }

  const fmt = (n: number) =>
    new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-US", {
      style: "currency",
      currency: "SAR",
      maximumFractionDigits: 0,
    }).format(n);

  const unitLabel = property?.name
    ? `${property.name} — ${unit?.unit_number ?? ""}`
    : unit?.unit_number ?? "—";

  const lateFee =
    lease.late_fee_type === "none"
      ? tlt("none")
      : lease.late_fee_type === "percentage"
        ? `${lease.late_fee_value ?? 0}%`
        : fmt(lease.late_fee_value ?? 0);

  const scheduleList = schedules ?? [];

  const info: { label: string; value: React.ReactNode }[] = [
    {
      label: tlabels("tenant"),
      value: tenant ? (
        <Link href={`/tenants/${tenant.id}`} className="text-brand-teal hover:underline">
          {tenant.full_name}
        </Link>
      ) : (
        "—"
      ),
    },
    {
      label: tlabels("unit"),
      value: unit?.property_id ? (
        <Link href={`/properties/${unit.property_id}`} className="text-brand-teal hover:underline">
          {unitLabel}
        </Link>
      ) : (
        unitLabel
      ),
    },
    { label: tlabels("rentPerInstallment"), value: <span dir="ltr">{fmt(lease.rent_amount)}</span> },
    { label: tlabels("frequency"), value: tf(lease.payment_frequency) },
    {
      label: tlabels("deposit"),
      value: lease.deposit_amount ? <span dir="ltr">{fmt(lease.deposit_amount)}</span> : "—",
    },
    { label: tlabels("lateFee"), value: lateFee },
    { label: tlabels("grace"), value: String(lease.grace_period_days ?? 0) },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/leases"
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-teal-900/60 transition hover:text-brand-teal-900"
      >
        <ArrowIcon className="h-4 w-4 rtl:rotate-180" />
        {t("title")}
      </Link>

      <div className="mb-7 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight text-brand-teal-900 sm:text-[28px]" dir="ltr">
          {lease.contract_number ?? `#${lease.id.slice(0, 8)}`}
        </h1>
        <LeaseStatusBadge status={lease.status} />

        <div className="flex items-center gap-2 sm:ms-auto">
          <Link
            href={`/leases/${id}/edit`}
            className="inline-flex items-center gap-2 rounded-xl border border-brand-teal/15 bg-white px-4 py-2.5 text-sm font-bold text-brand-teal-900 shadow-card transition hover:border-brand-teal/35 hover:bg-brand-teal/5"
          >
            <PencilIcon className="h-4 w-4 text-brand-teal" />
            {tc("edit")}
          </Link>
          {lease.status === "active" ? (
            <form action={terminateLeaseAction}>
              <input type="hidden" name="id" value={id} />
              <input type="hidden" name="locale" value={locale} />
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-white px-4 py-2.5 text-sm font-bold text-amber-700 transition hover:bg-amber-50"
              >
                {t("terminate")}
              </button>
            </form>
          ) : null}
          <DeleteButton action={deleteLeaseAction} id={id} locale={locale} />
        </div>
      </div>

      {/* تفاصيل العقد */}
      <div className="mb-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-brand-teal/10 bg-brand-teal/10 shadow-card sm:grid-cols-3 lg:grid-cols-4">
        <InfoCell label={tlabels("term")} value={<span dir="ltr">{lease.start_date} → {lease.end_date}</span>} wide />
        {info.map((cell, i) => (
          <InfoCell key={i} label={cell.label} value={cell.value} />
        ))}
      </div>

      {/* جدول الدفعات */}
      <h2 className="mb-4 text-lg font-bold text-brand-teal-900">
        {t("scheduleTitle")}
        {scheduleList.length > 0 ? (
          <span className="ms-2 text-sm font-semibold text-brand-teal-900/40">
            {scheduleList.length}
          </span>
        ) : null}
      </h2>

      {scheduleList.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-brand-teal/20 bg-white/60 px-5 py-8 text-center text-sm text-brand-teal-900/55">
          {t("noSchedule")}
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-brand-teal/10 bg-white shadow-card">
          {scheduleList.map((s, i) => (
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InfoCell({
  label,
  value,
  wide = false,
}: {
  label: string;
  value: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={`bg-white px-4 py-3.5 ${wide ? "col-span-2" : ""}`}>
      <p className="text-xs font-medium text-brand-teal-900/45">{label}</p>
      <p className="mt-1 text-sm font-bold text-brand-teal-900">{value}</p>
    </div>
  );
}
