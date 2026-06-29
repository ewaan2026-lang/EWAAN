import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { WrenchIcon, PlusIcon } from "@/components/ui/icons";
import {
  RequestCard,
  type RequestCardData,
} from "@/components/maintenance/request-card";

export const dynamic = "force-dynamic";

export default async function MaintenancePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("maintenance");

  const supabase = await createClient();
  const [{ data: requests }, { data: units }, { data: properties }] =
    await Promise.all([
      supabase
        .from("maintenance_requests")
        .select("id, title, priority, status, category, unit_id, reported_at")
        .order("reported_at", { ascending: false }),
      supabase.from("units").select("id, unit_number, property_id"),
      supabase.from("properties").select("id, name"),
    ]);

  const propName = new Map((properties ?? []).map((x) => [x.id, x.name]));
  const unitLabel = new Map(
    (units ?? []).map((u) => {
      const pn = u.property_id ? propName.get(u.property_id) : null;
      return [u.id, pn ? `${pn} — ${u.unit_number}` : u.unit_number];
    }),
  );

  const list: RequestCardData[] = (requests ?? []).map((r) => ({
    id: r.id,
    title: r.title,
    priority: r.priority,
    status: r.status,
    category: r.category,
    unitLabel: unitLabel.get(r.unit_id) ?? "—",
  }));

  const addButton = (label: string) => (
    <Link
      href="/maintenance/new"
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
          icon={<WrenchIcon className="h-7 w-7" />}
          title={t("emptyTitle")}
          body={t("emptyBody")}
          action={addButton(t("addFirst"))}
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((r) => (
            <RequestCard key={r.id} request={r} />
          ))}
        </div>
      )}
    </div>
  );
}
