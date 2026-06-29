import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrgId } from "@/lib/org";
import { PageHeader } from "@/components/ui/page-header";
import { OrgForm, type OrgData } from "@/components/settings/org-form";
import { SettingsIcon } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("settings");

  const orgId = await getActiveOrgId();
  const supabase = await createClient();

  let org: OrgData | null = null;
  if (orgId) {
    const { data } = await supabase
      .from("organizations")
      .select("id, name, legal_name, cr_number, vat_number, email, phone, default_locale")
      .eq("id", orgId)
      .maybeSingle();
    org = data;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      {org ? (
        <div className="overflow-hidden rounded-3xl border border-brand-teal/10 bg-white shadow-card">
          <div className="flex items-center gap-3 border-b border-brand-teal/8 bg-gradient-to-l from-brand-teal/5 to-transparent px-7 py-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-teal/10 text-brand-teal">
              <SettingsIcon className="h-5 w-5" />
            </span>
            <h2 className="text-lg font-bold text-brand-teal-900">{t("orgTitle")}</h2>
          </div>
          <div className="px-7 py-7">
            <OrgForm org={org} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
