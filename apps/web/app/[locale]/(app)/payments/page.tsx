import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { ScheduleStatusBadge } from "@/components/leases/status-badge";
import { recordPaymentAction } from "@/lib/actions/payments";
import { CardIcon, PlusIcon } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

export default async function PaymentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("payments");

  const supabase = await createClient();
  const [{ data: schedules }, { data: leases }, { data: tenants }, { data: units }, { data: properties }] =
    await Promise.all([
      supabase
        .from("payment_schedules")
        .select("id, lease_id, due_date, amount, status")
        .order("due_date", { ascending: true }),
      supabase.from("leases").select("id, tenant_id, unit_id"),
      supabase.from("tenants").select("id, full_name"),
      supabase.from("units").select("id, unit_number, property_id"),
      supabase.from("properties").select("id, name"),
    ]);

  const leaseById = new Map((leases ?? []).map((l) => [l.id, l]));
  const tenantName = new Map((tenants ?? []).map((x) => [x.id, x.full_name]));
  const propName = new Map((properties ?? []).map((x) => [x.id, x.name]));
  const unitLabel = new Map(
    (units ?? []).map((u) => {
      const pn = u.property_id ? propName.get(u.property_id) : null;
      return [u.id, pn ? `${pn} — ${u.unit_number}` : u.unit_number];
    }),
  );

  const today = new Date().toISOString().slice(0, 10);
  const rows = (schedules ?? []).map((s) => {
    const lease = leaseById.get(s.lease_id);
    const isOverdue = s.status !== "paid" && s.status !== "waived" && s.due_date < today;
    return {
      id: s.id,
      due_date: s.due_date,
      amount: s.amount,
      status: s.status,
      isOverdue,
      tenant: lease ? tenantName.get(lease.tenant_id) ?? "—" : "—",
      unit: lease ? unitLabel.get(lease.unit_id) ?? "—" : "—",
    };
  });

  const collected = rows.filter((r) => r.status === "paid").reduce((a, r) => a + r.amount, 0);
  const outstanding = rows
    .filter((r) => r.status !== "paid" && r.status !== "waived")
    .reduce((a, r) => a + r.amount, 0);
  const overdue = rows.filter((r) => r.isOverdue).reduce((a, r) => a + r.amount, 0);

  const fmt = (n: number) =>
    new Intl.NumberFormat(locale === "ar" ? "ar-SA-u-nu-latn" : "en-US", {
      style: "currency",
      currency: "SAR",
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      {rows.length === 0 ? (
        <EmptyState
          icon={<CardIcon className="h-7 w-7" />}
          title={t("emptyTitle")}
          body={t("emptyBody")}
          action={
            <Link
              href="/leases/new"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-teal px-5 py-2.5 text-sm font-bold text-white shadow-card transition hover:bg-brand-teal-700"
            >
              <PlusIcon className="h-4 w-4" />
              {t("createLease")}
            </Link>
          }
        />
      ) : (
        <>
          <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SummaryCard label={t("summary.collected")} value={fmt(collected)} tone="green" />
            <SummaryCard label={t("summary.outstanding")} value={fmt(outstanding)} tone="teal" />
            <SummaryCard label={t("summary.overdue")} value={fmt(overdue)} tone="rose" />
          </div>

          <div className="overflow-hidden rounded-2xl border border-brand-teal/10 bg-white shadow-card">
            {rows.map((r, i) => (
              <div
                key={r.id}
                className={`flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 ${
                  i > 0 ? "border-t border-brand-teal/8" : ""
                }`}
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-brand-teal-900">{r.tenant}</p>
                  <p className="truncate text-xs text-brand-teal-900/50">
                    {r.unit} · <span dir="ltr">{r.due_date}</span>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-brand-teal-900" dir="ltr">
                    {fmt(r.amount)}
                  </span>
                  {r.status === "paid" ? (
                    <ScheduleStatusBadge status="paid" />
                  ) : r.isOverdue ? (
                    <Badge tone="rose" dot>
                      {t("overdueBadge")}
                    </Badge>
                  ) : (
                    <ScheduleStatusBadge status={r.status} />
                  )}
                  {r.status !== "paid" && r.status !== "waived" ? (
                    <form action={recordPaymentAction}>
                      <input type="hidden" name="schedule_id" value={r.id} />
                      <input type="hidden" name="locale" value={locale} />
                      <button
                        type="submit"
                        className="rounded-lg bg-brand-teal/10 px-3 py-1.5 text-xs font-bold text-brand-teal-900 transition hover:bg-brand-teal hover:text-white"
                      >
                        {t("markPaid")}
                      </button>
                    </form>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "green" | "teal" | "rose";
}) {
  const color =
    tone === "green"
      ? "text-emerald-600"
      : tone === "rose"
        ? "text-rose-600"
        : "text-brand-teal-900";
  return (
    <div className="rounded-2xl border border-brand-teal/10 bg-white p-5 shadow-card">
      <p className="text-xs font-medium text-brand-teal-900/50">{label}</p>
      <p className={`mt-1.5 text-2xl font-extrabold ${color}`} dir="ltr">
        {value}
      </p>
    </div>
  );
}
