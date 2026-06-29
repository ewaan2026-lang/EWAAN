import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrgId } from "@/lib/org";
import { PageHeader } from "@/components/ui/page-header";
import { OrgForm, type OrgData } from "@/components/settings/org-form";
import {
  MembersSection,
  type MemberRow,
  type RoleOption,
} from "@/components/settings/members-section";
import {
  UnitTypesSection,
  type UnitTypeRow,
} from "@/components/settings/unit-types-section";
import { InviteForm } from "@/components/settings/invite-form";
import { SettingsIcon } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

const KNOWN_ROLES = ["admin", "owner", "staff", "tenant"];

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("settings");
  const tr = await getTranslations("roleNames");

  const orgId = await getActiveOrgId();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let org: OrgData | null = null;
  let memberRows: MemberRow[] = [];
  let roleOptions: RoleOption[] = [];
  let unitTypes: UnitTypeRow[] = [];

  if (orgId) {
    const [{ data: orgData }, { data: members }, { data: roles }] =
      await Promise.all([
        supabase
          .from("organizations")
          .select("id, name, legal_name, cr_number, vat_number, email, phone, default_locale")
          .eq("id", orgId)
          .maybeSingle(),
        supabase.from("org_members").select("id, user_id, role_id"),
        supabase.from("roles").select("id, key, name").eq("organization_id", orgId),
      ]);
    org = orgData;

    const { data: typesData } = await supabase
      .from("unit_types")
      .select("id, name, description")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: true });
    unitTypes = typesData ?? [];

    const roleLabel = (key: string, name: string) =>
      KNOWN_ROLES.includes(key) ? tr(key) : name;
    roleOptions = (roles ?? []).map((r) => ({
      id: r.id,
      label: roleLabel(r.key, r.name),
    }));

    const userIds = (members ?? []).map((m) => m.user_id);
    const { data: profiles } = userIds.length
      ? await supabase.from("profiles").select("id, full_name, email").in("id", userIds)
      : { data: [] };
    const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

    memberRows = (members ?? []).map((m) => {
      const p = profileById.get(m.user_id);
      return {
        id: m.id,
        name: p?.full_name ?? "",
        email: p?.email ?? "",
        roleId: m.role_id,
        isSelf: m.user_id === user?.id,
      };
    });
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      {org ? (
        <>
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

          <UnitTypesSection types={unitTypes} locale={locale} />
          <MembersSection members={memberRows} roles={roleOptions} locale={locale} />
          <InviteForm />
        </>
      ) : null}
    </div>
  );
}
