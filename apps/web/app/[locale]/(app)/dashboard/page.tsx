import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/stat-card";
import { CreateOrgForm } from "@/components/create-org-form";

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

  // هل ينتمي المستخدم لأي مؤسسة؟ (RLS تُرجع مؤسساته فقط)
  const { data: membership } = await supabase
    .from("org_members")
    .select("organization_id")
    .limit(1)
    .maybeSingle();

  // لا مؤسسة بعد → اعرض إنشاء المؤسسة
  if (!membership) {
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

  // إحصاءات حيّة (محميّة بـ RLS — مؤسسة المستخدم فقط)
  const [
    { count: properties },
    { count: units },
    { count: occupied },
    { count: leases },
  ] = await Promise.all([
    supabase.from("properties").select("*", { count: "exact", head: true }),
    supabase.from("units").select("*", { count: "exact", head: true }),
    supabase
      .from("units")
      .select("*", { count: "exact", head: true })
      .eq("status", "occupied"),
    supabase
      .from("leases")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
  ]);

  const totalUnits = units ?? 0;
  const occupancy =
    totalUnits > 0 ? Math.round(((occupied ?? 0) / totalUnits) * 100) : 0;

  const { data: org } = await supabase
    .from("organizations")
    .select("name")
    .eq("id", membership.organization_id)
    .maybeSingle();

  const orgName = org?.name ?? "";
  const displayName = user?.email?.split("@")[0] ?? orgName;

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-8">
        <p className="text-sm text-brand-teal-900/50">{orgName}</p>
        <h1 className="mt-1 text-2xl font-extrabold text-brand-teal-900">
          {t("welcome", { name: displayName })}
        </h1>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label={t("properties")} value={properties ?? 0} />
        <StatCard label={t("units")} value={totalUnits} />
        <StatCard label={t("leases")} value={leases ?? 0} />
        <StatCard label={t("occupancy")} value={`${occupancy}%`} accent />
      </div>

      {totalUnits === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-brand-teal/20 bg-white/50 p-10 text-center">
          <p className="text-brand-teal-900/60">{t("emptyState")}</p>
        </div>
      ) : null}
    </div>
  );
}
