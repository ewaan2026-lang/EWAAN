import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { UsersIcon, PlusIcon } from "@/components/ui/icons";
import {
  OwnersExplorer,
  type OwnerItem,
} from "@/components/owners/owners-explorer";

export const dynamic = "force-dynamic";

export default async function OwnersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("owners");

  const supabase = await createClient();
  const [{ data: owners }, { data: properties }] = await Promise.all([
    supabase
      .from("owners")
      .select("id, full_name, phone, email, commission_rate")
      .order("created_at", { ascending: false }),
    supabase.from("properties").select("owner_id"),
  ]);

  const countByOwner = new Map<string, number>();
  for (const p of properties ?? []) {
    if (p.owner_id)
      countByOwner.set(p.owner_id, (countByOwner.get(p.owner_id) ?? 0) + 1);
  }

  const list: OwnerItem[] = (owners ?? []).map((o) => ({
    id: o.id,
    full_name: o.full_name,
    phone: o.phone,
    email: o.email,
    commission_rate: o.commission_rate,
    propertyCount: countByOwner.get(o.id) ?? 0,
  }));

  const addButton = (label: string) => (
    <Link
      href="/owners/new"
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
        <OwnersExplorer owners={list} locale={locale} />
      )}
    </div>
  );
}
