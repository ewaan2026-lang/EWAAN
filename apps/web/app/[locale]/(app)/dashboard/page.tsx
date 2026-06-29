import type { ReactNode } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { CreateOrgForm } from "@/components/create-org-form";
import { StatLinkCard } from "@/components/dashboard/stat-link-card";
import { OccupancyRing } from "@/components/dashboard/occupancy-ring";
import { LeaseStatusBadge } from "@/components/leases/status-badge";
import {
  BuildingIcon,
  DoorIcon,
  LayersIcon,
  UsersIcon,
  KeyIcon,
  PlusIcon,
  ChartIcon,
  ClockIcon,
  CardIcon,
  ReceiptIcon,
} from "@/components/ui/icons";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("dashboard");
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: membership } = await supabase
    .from("org_members")
    .select("organization_id")
    .limit(1)
    .maybeSingle();

  if (!membership) {
    // المستخدم ليس عضواً في مؤسسة — إن كان مستأجراً مرتبطاً، حوّله لبوابة المستأجر.
    const { data: asTenant } = await supabase.from("tenants").select("id").limit(1);
    if ((asTenant ?? []).length > 0) {
      redirect(`/${locale}/portal`);
    }

    return (
      <div className="mx-auto max-w-md pt-10">
        <h1 className="mb-1 text-2xl font-extrabold text-brand-teal-900">
          {t("noOrgTitle")}
        </h1>
        <p className="mb-6 text-sm text-brand-teal-900/60">{t("noOrgSubtitle")}</p>
        <div className="rounded-2xl border border-brand-teal/10 bg-white p-6 shadow-card">
          <CreateOrgForm />
        </div>
      </div>
    );
  }

  const head = { count: "exact" as const, head: true };
  const [
    { count: properties },
    { count: units },
    { count: occupied },
    { count: leases },
    { count: tenants },
    { count: owners },
    { data: org },
    { data: recent },
    { data: allTenants },
    { data: allUnits },
    { data: allProps },
    { data: schedules },
    { data: deposits },
  ] = await Promise.all([
    supabase.from("properties").select("*", head),
    supabase.from("units").select("*", head),
    supabase.from("units").select("*", head).eq("status", "occupied"),
    supabase.from("leases").select("*", head).eq("status", "active"),
    supabase.from("tenants").select("*", head),
    supabase.from("owners").select("*", head),
    supabase.from("organizations").select("name").eq("id", membership.organization_id).maybeSingle(),
    supabase
      .from("leases")
      .select("id, contract_number, status, rent_amount, unit_id, tenant_id, start_date")
      .order("start_date", { ascending: false })
      .limit(5),
    supabase.from("tenants").select("id, full_name"),
    supabase.from("units").select("id, unit_number, property_id"),
    supabase.from("properties").select("id, name"),
    supabase.from("payment_schedules").select("amount, status, due_date"),
    supabase.from("deposits").select("amount, status"),
  ]);

  const totalUnits = units ?? 0;
  const occupancy =
    totalUnits > 0 ? Math.round(((occupied ?? 0) / totalUnits) * 100) : 0;
  const orgName = org?.name ?? "";
  const displayName = user?.email?.split("@")[0] ?? orgName;

  const sched = schedules ?? [];
  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const today = now.toISOString().slice(0, 10);
  const isUnpaid = (s: { status: string }) =>
    s.status !== "paid" && s.status !== "waived";

  const collected = sched
    .filter((s) => s.status === "paid")
    .reduce((a, s) => a + s.amount, 0);
  const outstanding = sched.filter(isUnpaid).reduce((a, s) => a + s.amount, 0);
  const overdue = sched
    .filter((s) => isUnpaid(s) && s.due_date < today)
    .reduce((a, s) => a + s.amount, 0);
  const dueThisMonth = sched
    .filter((s) => isUnpaid(s) && s.due_date.slice(0, 7) === ym)
    .reduce((a, s) => a + s.amount, 0);
  const collectedThisMonth = sched
    .filter((s) => s.status === "paid" && s.due_date.slice(0, 7) === ym)
    .reduce((a, s) => a + s.amount, 0);
  const depositsHeld = (deposits ?? [])
    .filter((d) => d.status === "held")
    .reduce((a, d) => a + d.amount, 0);
  const collectionRate =
    collected + outstanding > 0
      ? Math.round((collected / (collected + outstanding)) * 100)
      : 0;

  const tenantName = new Map((allTenants ?? []).map((x) => [x.id, x.full_name]));
  const propName = new Map((allProps ?? []).map((x) => [x.id, x.name]));
  const unitLabel = new Map(
    (allUnits ?? []).map((u) => {
      const pn = u.property_id ? propName.get(u.property_id) : null;
      return [u.id, pn ? `${pn} — ${u.unit_number}` : u.unit_number];
    }),
  );

  const fmt = (n: number) =>
    new Intl.NumberFormat(locale === "ar" ? "ar-SA-u-nu-latn" : "en-US", {
      style: "currency",
      currency: "SAR",
      maximumFractionDigits: 0,
    }).format(n);

  const recentLeases = recent ?? [];

  const actions = [
    { href: "/properties/new", label: t("addProperty") },
    { href: "/leases/new", label: t("createLease") },
    { href: "/tenants/new", label: t("addTenant") },
    { href: "/owners/new", label: t("addOwner") },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      {/* الهيرو الفاخر */}
      <section className="relative mb-7 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-night via-brand-ink to-brand-teal-900 p-7 text-white shadow-luxe sm:p-9">
        <div className="float-slow pointer-events-none absolute -end-24 -top-28 h-72 w-72 rounded-full bg-brand-gold/15 blur-3xl" />
        <div className="float-slower pointer-events-none absolute -bottom-28 -start-16 h-72 w-72 rounded-full bg-brand-teal/30 blur-3xl" />
        <span className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-brand-gold to-transparent opacity-70" />

        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-brand-gold">
              {orgName}
            </p>
            <h1 className="mt-2.5 text-3xl font-extrabold tracking-tight sm:text-4xl">
              {t("welcome", { name: displayName })}
            </h1>
            <p className="mt-1.5 text-sm text-white/55">{t("portfolioPulse")}</p>
            <div className="mt-5 h-px w-28 bg-gradient-to-r from-brand-gold to-transparent" />

            <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-4">
              <HeroStat value={fmt(collected)} label={t("collected")} dot="#FFD700" gold />
              <span className="hidden h-10 w-px bg-white/10 sm:block" />
              <HeroStat value={fmt(outstanding)} label={t("outstanding")} dot="#9FE1CB" />
              <span className="hidden h-10 w-px bg-white/10 sm:block" />
              <HeroStat value={fmt(overdue)} label={t("overdue")} dot="#F0997B" />
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-4 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 backdrop-blur">
            <OccupancyRing value={occupancy} />
            <div>
              <p className="text-sm font-bold text-white">{t("occupancy")}</p>
              <p className="text-xs text-white/50" dir="ltr">
                {occupied ?? 0}/{totalUnits} · {t("units")}
              </p>
            </div>
          </div>
        </div>

        {/* إجراءات سريعة داخل البطاقة الداكنة */}
        <div className="relative mt-8 border-t border-white/10 pt-6">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">
            {t("quickActions")}
          </p>
          <div className="flex flex-wrap gap-2.5">
            {actions.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="group inline-flex items-center gap-2.5 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold text-white ring-1 ring-white/15 backdrop-blur transition hover:bg-white/[0.18] hover:ring-brand-gold/45"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-gold/20 text-brand-gold-soft transition group-hover:bg-brand-gold/35">
                  <PlusIcon className="h-3.5 w-3.5" />
                </span>
                {a.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* الملخّص المالي */}
      <div className="stagger mb-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <FinCard label={t("collectionRate")} value={`${collectionRate}%`} icon={<ChartIcon className="h-5 w-5" />} accent />
        <FinCard label={t("dueThisMonth")} value={fmt(dueThisMonth)} icon={<ClockIcon className="h-5 w-5" />} tone="amber" />
        <FinCard label={t("collectedThisMonth")} value={fmt(collectedThisMonth)} icon={<CardIcon className="h-5 w-5" />} tone="green" />
        <FinCard label={t("depositsHeld")} value={fmt(depositsHeld)} icon={<ReceiptIcon className="h-5 w-5" />} />
      </div>

      {/* الإحصاءات */}
      <div className="stagger grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatLinkCard label={t("properties")} value={properties ?? 0} href="/properties" icon={<BuildingIcon className="h-5 w-5" />} />
        <StatLinkCard label={t("units")} value={totalUnits} href="/properties" icon={<DoorIcon className="h-5 w-5" />} />
        <StatLinkCard label={t("leases")} value={leases ?? 0} href="/leases" accent icon={<LayersIcon className="h-5 w-5" />} />
        <StatLinkCard label={t("tenants")} value={tenants ?? 0} href="/tenants" icon={<UsersIcon className="h-5 w-5" />} />
        <StatLinkCard label={t("owners")} value={owners ?? 0} href="/owners" icon={<KeyIcon className="h-5 w-5" />} />
      </div>

      {/* أحدث العقود */}
      <div className="mt-9">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-brand-teal-900">
            {t("recentLeasesTitle")}
          </h2>
          {recentLeases.length > 0 ? (
            <Link href="/leases" className="text-sm font-semibold text-brand-teal hover:underline">
              {t("viewAll")}
            </Link>
          ) : null}
        </div>

        {recentLeases.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-brand-teal/20 bg-white/60 px-5 py-8 text-center text-sm text-brand-teal-900/55">
            {t("noRecentLeases")}
          </p>
        ) : (
          <div className="relative overflow-hidden rounded-2xl border border-brand-teal/10 bg-white shadow-luxe">
            <span className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-gold via-brand-brass to-brand-gold opacity-90" />
            {recentLeases.map((l, i) => (
              <Link
                key={l.id}
                href={`/leases/${l.id}`}
                className={`flex items-center justify-between gap-3 px-5 py-3.5 transition hover:bg-brand-teal/5 ${
                  i > 0 ? "border-t border-brand-teal/8" : ""
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-brand-teal-900">
                    {unitLabel.get(l.unit_id) ?? "—"}
                  </p>
                  <p className="truncate text-xs text-brand-teal-900/50">
                    {tenantName.get(l.tenant_id) ?? "—"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-brand-teal-900" dir="ltr">
                    {fmt(l.rent_amount)}
                  </span>
                  <LeaseStatusBadge status={l.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function HeroStat({
  value,
  label,
  dot,
  gold,
}: {
  value: string;
  label: string;
  dot: string;
  gold?: boolean;
}) {
  return (
    <div>
      <p
        className={`text-2xl font-extrabold tabular-nums sm:text-3xl ${
          gold ? "text-brand-gold-soft" : "text-white"
        }`}
        dir="ltr"
      >
        {value}
      </p>
      <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-white/45">
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: dot }} />
        {label}
      </p>
    </div>
  );
}

function FinCard({
  label,
  value,
  icon,
  tone,
  accent,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  tone?: "amber" | "green";
  accent?: boolean;
}) {
  const valColor =
    tone === "amber"
      ? "text-amber-600"
      : tone === "green"
        ? "text-emerald-600"
        : accent
          ? "text-brand-brass"
          : "text-brand-teal-900";
  const iconCls = accent
    ? "bg-gradient-to-br from-brand-gold/25 to-brand-brass/20 text-brand-brass"
    : tone === "amber"
      ? "bg-amber-50 text-amber-600"
      : tone === "green"
        ? "bg-emerald-50 text-emerald-600"
        : "bg-brand-teal/10 text-brand-teal";
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-brand-teal/10 bg-white p-5 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-luxe">
      <span className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-gold via-brand-brass to-brand-gold opacity-90" />
      <span
        className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 ${iconCls}`}
      >
        {icon}
      </span>
      <p className={`mt-4 text-2xl font-extrabold leading-none tabular-nums ${valColor}`} dir="ltr">
        {value}
      </p>
      <p className="mt-1.5 text-xs font-semibold tracking-wide text-brand-teal-900/45">{label}</p>
    </div>
  );
}
