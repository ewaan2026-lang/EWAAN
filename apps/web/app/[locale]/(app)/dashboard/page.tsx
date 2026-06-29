import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { CreateOrgForm } from "@/components/create-org-form";
import { StatLinkCard } from "@/components/dashboard/stat-link-card";
import { LeaseStatusBadge } from "@/components/leases/status-badge";
import {
  BuildingIcon,
  DoorIcon,
  LayersIcon,
  UsersIcon,
  KeyIcon,
  GaugeIcon,
  PlusIcon,
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
  ]);

  const totalUnits = units ?? 0;
  const occupancy =
    totalUnits > 0 ? Math.round(((occupied ?? 0) / totalUnits) * 100) : 0;
  const orgName = org?.name ?? "";
  const displayName = user?.email?.split("@")[0] ?? orgName;

  const tenantName = new Map((allTenants ?? []).map((x) => [x.id, x.full_name]));
  const propName = new Map((allProps ?? []).map((x) => [x.id, x.name]));
  const unitLabel = new Map(
    (allUnits ?? []).map((u) => {
      const pn = u.property_id ? propName.get(u.property_id) : null;
      return [u.id, pn ? `${pn} — ${u.unit_number}` : u.unit_number];
    }),
  );

  const fmt = (n: number) =>
    new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-US", {
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
    <div className="mx-auto max-w-5xl">
      <header className="mb-7">
        <p className="text-sm text-brand-teal-900/50">{orgName}</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-brand-teal-900 sm:text-[28px]">
          {t("welcome", { name: displayName })}
        </h1>
      </header>

      {/* إجراءات سريعة */}
      <div className="mb-7 flex flex-wrap gap-2.5">
        {actions.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="inline-flex items-center gap-2 rounded-xl border border-brand-teal/15 bg-white px-4 py-2.5 text-sm font-bold text-brand-teal-900 shadow-card transition hover:border-brand-teal/35 hover:bg-brand-teal/5"
          >
            <PlusIcon className="h-4 w-4 text-brand-teal" />
            {a.label}
          </Link>
        ))}
      </div>

      {/* الإحصاءات */}
      <div className="stagger grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatLinkCard label={t("properties")} value={properties ?? 0} href="/properties" icon={<BuildingIcon className="h-5 w-5" />} />
        <StatLinkCard label={t("units")} value={totalUnits} href="/properties" icon={<DoorIcon className="h-5 w-5" />} />
        <StatLinkCard label={t("occupancy")} value={occupancy} suffix="%" accent icon={<GaugeIcon className="h-5 w-5" />} />
        <StatLinkCard label={t("leases")} value={leases ?? 0} href="/leases" icon={<LayersIcon className="h-5 w-5" />} />
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
          <div className="overflow-hidden rounded-2xl border border-brand-teal/10 bg-white shadow-card">
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
