import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { BuildingIcon, PlusIcon } from "@/components/ui/icons";
import {
  PropertyCard,
  type PropertyStats,
} from "@/components/properties/property-card";

export const dynamic = "force-dynamic";

export default async function PropertiesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("properties");

  const supabase = await createClient();

  const { data: properties } = await supabase
    .from("properties")
    .select("id, name, property_type, address, national_address")
    .order("created_at", { ascending: false });

  const { data: units } = await supabase
    .from("units")
    .select("property_id, status");

  // إحصاءات الوحدات لكل عقار
  const statsByProperty = new Map<string, PropertyStats>();
  for (const u of units ?? []) {
    const s =
      statsByProperty.get(u.property_id) ??
      ({ total: 0, occupied: 0, vacant: 0 } as PropertyStats);
    s.total += 1;
    if (u.status === "occupied") s.occupied += 1;
    if (u.status === "vacant") s.vacant += 1;
    statsByProperty.set(u.property_id, s);
  }

  const list = properties ?? [];

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        action={
          list.length > 0 ? (
            <Link
              href="/properties/new"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-teal px-5 py-2.5 text-sm font-bold text-white shadow-card transition hover:bg-brand-teal-700"
            >
              <PlusIcon className="h-4 w-4" />
              {t("add")}
            </Link>
          ) : null
        }
      />

      {list.length === 0 ? (
        <EmptyState
          icon={<BuildingIcon className="h-7 w-7" />}
          title={t("emptyTitle")}
          body={t("emptyBody")}
          action={
            <Link
              href="/properties/new"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-teal px-5 py-2.5 text-sm font-bold text-white shadow-card transition hover:bg-brand-teal-700"
            >
              <PlusIcon className="h-4 w-4" />
              {t("addFirst")}
            </Link>
          }
        />
      ) : (
        <div className="stagger grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <PropertyCard
              key={p.id}
              property={p}
              stats={
                statsByProperty.get(p.id) ?? { total: 0, occupied: 0, vacant: 0 }
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
