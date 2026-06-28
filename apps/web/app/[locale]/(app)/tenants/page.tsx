import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { UsersIcon, PlusIcon } from "@/components/ui/icons";
import { TenantCard } from "@/components/tenants/tenant-card";

export const dynamic = "force-dynamic";

export default async function TenantsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("tenants");

  const supabase = await createClient();
  const { data: tenants } = await supabase
    .from("tenants")
    .select("id, full_name, phone, email, national_id")
    .order("created_at", { ascending: false });

  const list = tenants ?? [];
  const addButton = (label: string) => (
    <Link
      href="/tenants/new"
      className="inline-flex items-center gap-2 rounded-xl bg-brand-teal px-5 py-2.5 text-sm font-bold text-white shadow-card transition hover:bg-brand-teal-700"
    >
      <PlusIcon className="h-4 w-4" />
      {label}
    </Link>
  );

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        action={list.length > 0 ? addButton(t("add")) : null}
      />

      {list.length === 0 ? (
        <EmptyState
          icon={<UsersIcon className="h-7 w-7" />}
          title={t("emptyTitle")}
          body={t("emptyBody")}
          action={addButton(t("addFirst"))}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((tn) => (
            <TenantCard key={tn.id} tenant={tn} />
          ))}
        </div>
      )}
    </div>
  );
}
