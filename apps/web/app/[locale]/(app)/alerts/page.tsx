import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { CardIcon, WrenchIcon, LayersIcon, BellIcon } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

export default async function AlertsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("alerts");

  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const in30 = new Date();
  in30.setDate(in30.getDate() + 30);
  const in30Str = in30.toISOString().slice(0, 10);

  const [
    { data: overdue },
    { data: newReqs },
    { data: expiring },
    { data: tenants },
    { data: units },
    { data: properties },
    { data: leases },
  ] = await Promise.all([
    supabase
      .from("payment_schedules")
      .select("id, lease_id, amount, due_date")
      .eq("status", "pending")
      .lt("due_date", today)
      .order("due_date", { ascending: true }),
    supabase
      .from("maintenance_requests")
      .select("id, title, unit_id")
      .eq("status", "new")
      .order("created_at", { ascending: false }),
    supabase
      .from("leases")
      .select("id, contract_number, tenant_id, end_date")
      .eq("status", "active")
      .gte("end_date", today)
      .lte("end_date", in30Str)
      .order("end_date", { ascending: true }),
    supabase.from("tenants").select("id, full_name"),
    supabase.from("units").select("id, unit_number, property_id"),
    supabase.from("properties").select("id, name"),
    supabase.from("leases").select("id, tenant_id, unit_id"),
  ]);

  const tenantName = new Map((tenants ?? []).map((x) => [x.id, x.full_name]));
  const propName = new Map((properties ?? []).map((x) => [x.id, x.name]));
  const unitLabel = new Map(
    (units ?? []).map((u) => {
      const pn = u.property_id ? propName.get(u.property_id) : null;
      return [u.id, pn ? `${pn} — ${u.unit_number}` : u.unit_number];
    }),
  );
  const leaseById = new Map((leases ?? []).map((l) => [l.id, l]));

  const fmt = (n: number) =>
    new Intl.NumberFormat("ar-SA-u-nu-latn", {
      style: "currency",
      currency: "SAR",
      maximumFractionDigits: 0,
    }).format(n);

  const overdueRows = (overdue ?? []).map((s) => {
    const lease = leaseById.get(s.lease_id);
    return {
      id: s.id,
      tenant: lease ? tenantName.get(lease.tenant_id) ?? "—" : "—",
      amount: s.amount,
      due_date: s.due_date,
    };
  });

  const total = overdueRows.length + (newReqs ?? []).length + (expiring ?? []).length;

  if (total === 0) {
    return (
      <div className="mx-auto max-w-4xl">
        <PageHeader title={t("title")} subtitle={t("subtitle")} />
        <EmptyState icon={<BellIcon className="h-7 w-7" />} title={t("none")} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="space-y-6">
        {/* دفعات متأخّرة */}
        {overdueRows.length > 0 ? (
          <Section
            icon={<CardIcon className="h-5 w-5" />}
            tone="rose"
            title={t("overdueTitle")}
            count={overdueRows.length}
          >
            {overdueRows.map((r) => (
              <Link
                key={r.id}
                href="/payments"
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 transition hover:bg-brand-teal/[0.03]"
              >
                <div>
                  <p className="text-sm font-bold text-brand-teal-900">{r.tenant}</p>
                  <p className="text-xs text-rose-600" dir="ltr">
                    {t("dueOn", { date: r.due_date })}
                  </p>
                </div>
                <span className="text-sm font-bold text-brand-teal-900" dir="ltr">
                  {fmt(r.amount)}
                </span>
              </Link>
            ))}
          </Section>
        ) : null}

        {/* طلبات صيانة جديدة */}
        {(newReqs ?? []).length > 0 ? (
          <Section
            icon={<WrenchIcon className="h-5 w-5" />}
            tone="violet"
            title={t("newRequestsTitle")}
            count={(newReqs ?? []).length}
          >
            {(newReqs ?? []).map((r) => (
              <Link
                key={r.id}
                href={`/maintenance/${r.id}`}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 transition hover:bg-brand-teal/[0.03]"
              >
                <p className="text-sm font-bold text-brand-teal-900">{r.title}</p>
                <span className="text-xs text-brand-teal-900/55">
                  {unitLabel.get(r.unit_id) ?? "—"}
                </span>
              </Link>
            ))}
          </Section>
        ) : null}

        {/* عقود تنتهي قريباً */}
        {(expiring ?? []).length > 0 ? (
          <Section
            icon={<LayersIcon className="h-5 w-5" />}
            tone="amber"
            title={t("expiringTitle")}
            count={(expiring ?? []).length}
          >
            {(expiring ?? []).map((l) => (
              <Link
                key={l.id}
                href={`/leases/${l.id}`}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 transition hover:bg-brand-teal/[0.03]"
              >
                <p className="text-sm font-bold text-brand-teal-900" dir="ltr">
                  {l.contract_number ?? `#${l.id.slice(0, 8)}`}
                </p>
                <span className="text-xs text-amber-600" dir="ltr">
                  {t("expiresOn", { date: l.end_date })}
                </span>
              </Link>
            ))}
          </Section>
        ) : null}
      </div>
    </div>
  );
}

function Section({
  icon,
  tone,
  title,
  count,
  children,
}: {
  icon: React.ReactNode;
  tone: "rose" | "violet" | "amber";
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  const toneCls =
    tone === "rose"
      ? "bg-rose-50 text-rose-600"
      : tone === "violet"
        ? "bg-violet-50 text-violet-600"
        : "bg-amber-50 text-amber-600";
  return (
    <div className="overflow-hidden rounded-2xl border border-brand-teal/10 bg-white shadow-card">
      <div className="flex items-center gap-3 border-b border-brand-teal/8 px-5 py-3.5">
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${toneCls}`}>
          {icon}
        </span>
        <h2 className="text-sm font-bold text-brand-teal-900">{title}</h2>
        <Badge tone={tone}>{count}</Badge>
      </div>
      <div className="divide-y divide-brand-teal/8">{children}</div>
    </div>
  );
}
