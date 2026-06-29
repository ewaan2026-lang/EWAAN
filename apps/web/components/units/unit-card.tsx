import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { UnitStatusBadge } from "@/components/units/status-badge";
import { DeleteButton } from "@/components/ui/delete-button";
import { deleteUnitAction } from "@/lib/actions/units";
import { DoorIcon, PencilIcon } from "@/components/ui/icons";
import type { Enums } from "@ewaan/db";

export type UnitCardData = {
  id: string;
  unit_number: string;
  status: Enums<"unit_status">;
  floor: number | null;
  area_sqm: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  base_rent: number | null;
};

export async function UnitCard({
  unit,
  locale,
  propertyId,
}: {
  unit: UnitCardData;
  locale: string;
  propertyId: string;
}) {
  const t = await getTranslations("units");
  const meta: string[] = [];
  if (unit.floor != null) meta.push(t("labelFloor", { n: unit.floor }));
  if (unit.area_sqm != null) meta.push(t("labelArea", { n: unit.area_sqm }));
  if (unit.bedrooms != null) meta.push(t("labelBeds", { n: unit.bedrooms }));
  if (unit.bathrooms != null) meta.push(t("labelBaths", { n: unit.bathrooms }));

  const rent =
    unit.base_rent != null
      ? new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-US", {
          style: "currency",
          currency: "SAR",
          maximumFractionDigits: 0,
        }).format(unit.base_rent)
      : null;

  return (
    <div className="rounded-2xl border border-brand-teal/10 bg-white p-4 shadow-card transition hover:border-brand-teal/20">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-teal/8 text-brand-teal">
            <DoorIcon className="h-[18px] w-[18px]" />
          </span>
          <span className="text-[15px] font-extrabold text-brand-teal-900">
            {unit.unit_number}
          </span>
        </div>
        <UnitStatusBadge status={unit.status} />
      </div>

      {meta.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {meta.map((m, i) => (
            <span
              key={i}
              className="rounded-md bg-brand-cream/60 px-2 py-0.5 text-[11px] font-medium text-brand-teal-900/60"
            >
              {m}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-brand-teal/8 pt-3">
        {rent ? (
          <p className="text-sm font-bold text-brand-teal-900" dir="ltr">
            {rent}
          </p>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-1">
          <Link
            href={`/properties/${propertyId}/units/${unit.id}/edit`}
            aria-label={t("add")}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-teal-900/45 transition hover:bg-brand-teal/5 hover:text-brand-teal-900"
          >
            <PencilIcon className="h-4 w-4" />
          </Link>
          <DeleteButton
            action={deleteUnitAction}
            id={unit.id}
            locale={locale}
            variant="icon"
            extra={{ property_id: propertyId }}
          />
        </div>
      </div>
    </div>
  );
}
