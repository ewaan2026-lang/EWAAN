import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { LeafletMap } from "@/components/map/leaflet-map";
import { MapPinIcon } from "@/components/ui/icons";
import type { MapMarker } from "@/components/map/map-impl";

export const dynamic = "force-dynamic";

export default async function MapPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("map");
  const tn = await getTranslations("nav");
  const tp = await getTranslations("propertyTypes");

  const supabase = await createClient();
  const { data: properties } = await supabase
    .from("properties")
    .select("id, name, property_type, address, latitude, longitude")
    .not("latitude", "is", null)
    .not("longitude", "is", null);

  const markers: MapMarker[] = (properties ?? [])
    .filter((p) => p.latitude != null && p.longitude != null)
    .map((p) => {
      const a = (p.address ?? null) as
        | { city?: string | null; district?: string | null }
        | null;
      const loc = [a?.district, a?.city].filter(Boolean).join("، ");
      return {
        id: p.id,
        lat: p.latitude as number,
        lng: p.longitude as number,
        label: p.name,
        sub: [tp(p.property_type), loc].filter(Boolean).join(" · "),
        href: `/${locale}/properties/${p.id}`,
      };
    });

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title={tn("map")} subtitle={t("subtitle")} />

      {markers.length === 0 ? (
        <EmptyState
          icon={<MapPinIcon className="h-7 w-7" />}
          title={t("emptyTitle")}
          body={t("emptyBody")}
        />
      ) : (
        <>
          <div className="relative overflow-hidden rounded-3xl border border-brand-teal/10 shadow-luxe">
            <span className="pointer-events-none absolute inset-x-0 top-0 z-[1000] h-1 bg-gradient-to-r from-brand-gold via-brand-brass to-brand-gold opacity-90" />
            <div className="h-[70vh] min-h-[420px] w-full">
              <LeafletMap lat={null} lng={null} interactive zoom={11} markers={markers} />
            </div>
          </div>
          <p className="mt-3 text-center text-xs font-medium text-brand-teal-900/45">
            {t("shownCount", { count: markers.length })}
          </p>
        </>
      )}
    </div>
  );
}
