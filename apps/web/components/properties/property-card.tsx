import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PropertyTypeBadge } from "@/components/properties/type-badge";
import { BuildingIcon, MapPinIcon } from "@/components/ui/icons";
import type { Enums, Json } from "@ewaan/db";

export type PropertyCardData = {
  id: string;
  name: string;
  property_type: Enums<"property_type">;
  address: Json | null;
  national_address: string | null;
};

export type PropertyStats = { total: number; occupied: number; vacant: number };

function locationText(address: Json | null, nationalAddress: string | null) {
  const a = (address ?? null) as { city?: string | null; district?: string | null } | null;
  const parts = [a?.district, a?.city].filter(Boolean) as string[];
  if (parts.length) return parts.join("، ");
  return nationalAddress ?? null;
}

export async function PropertyCard({
  property,
  stats,
}: {
  property: PropertyCardData;
  stats: PropertyStats;
}) {
  const t = await getTranslations("properties.stats");
  const occupancy =
    stats.total > 0 ? Math.round((stats.occupied / stats.total) * 100) : 0;
  const location = locationText(property.address, property.national_address);

  return (
    <Link
      href={`/properties/${property.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-brand-teal/10 bg-white shadow-card transition hover:-translate-y-0.5 hover:border-brand-teal/25 hover:shadow-lg"
    >
      <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-teal via-brand-brass to-brand-gold opacity-80" />

      <div className="flex items-start justify-between gap-3 p-5 pb-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-teal/10 text-brand-teal">
            <BuildingIcon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-[15px] font-bold text-brand-teal-900">
              {property.name}
            </h3>
            {location ? (
              <p className="mt-0.5 flex items-center gap-1 text-xs text-brand-teal-900/50">
                <MapPinIcon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{location}</span>
              </p>
            ) : null}
          </div>
        </div>
        <PropertyTypeBadge type={property.property_type} />
      </div>

      <div className="mt-auto border-t border-brand-teal/8 px-5 py-4">
        <div className="flex items-center justify-between text-center">
          <Stat label={t("units")} value={stats.total} />
          <span className="h-8 w-px bg-brand-teal/10" />
          <Stat label={t("occupied")} value={stats.occupied} tone="green" />
          <span className="h-8 w-px bg-brand-teal/10" />
          <Stat label={t("vacant")} value={stats.vacant} tone="amber" />
        </div>
        <div className="mt-3.5 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-brand-teal/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-teal to-brand-teal-700 transition-all"
              style={{ width: `${occupancy}%` }}
            />
          </div>
          <span className="text-xs font-bold text-brand-teal-900/70">
            {occupancy}%
          </span>
        </div>
      </div>
    </Link>
  );
}

function Stat({
  label,
  value,
  tone = "teal",
}: {
  label: string;
  value: number;
  tone?: "teal" | "green" | "amber";
}) {
  const color =
    tone === "green"
      ? "text-emerald-600"
      : tone === "amber"
        ? "text-amber-600"
        : "text-brand-teal-900";
  return (
    <div className="flex-1">
      <p className={`text-lg font-extrabold ${color}`}>{value}</p>
      <p className="text-[11px] font-medium text-brand-teal-900/45">{label}</p>
    </div>
  );
}
