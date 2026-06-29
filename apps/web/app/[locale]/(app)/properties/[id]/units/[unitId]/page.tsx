import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { UnitStatusBadge } from "@/components/units/status-badge";
import { DeleteButton } from "@/components/ui/delete-button";
import { deleteUnitAction } from "@/lib/actions/units";
import { MediaGallery } from "@/components/media/media-gallery";
import { ListingCopy } from "@/components/units/listing-copy";
import { MetersSection } from "@/components/units/meters-section";
import { Badge } from "@/components/ui/badge";
import { ArrowIcon, PencilIcon } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

export default async function UnitDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string; unitId: string }>;
}) {
  const { locale, id, unitId } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("units");
  const tc = await getTranslations("common");
  const tmedia = await getTranslations("media");

  const supabase = await createClient();
  const { data: unit } = await supabase
    .from("units")
    .select(
      "id, unit_number, status, floor, area_sqm, bedrooms, bathrooms, base_rent, furnished, features, listing_text, has_water_tank, organization_id",
    )
    .eq("id", unitId)
    .maybeSingle();

  if (!unit) notFound();

  const fmt = (n: number) =>
    new Intl.NumberFormat("ar-SA-u-nu-latn", {
      style: "currency",
      currency: "SAR",
      maximumFractionDigits: 0,
    }).format(n);

  const info: { label: string; value: string }[] = [];
  if (unit.floor != null) info.push({ label: t("fields.floor"), value: String(unit.floor) });
  if (unit.area_sqm != null) info.push({ label: t("fields.area"), value: t("labelArea", { n: unit.area_sqm }) });
  if (unit.bedrooms != null) info.push({ label: t("fields.bedrooms"), value: String(unit.bedrooms) });
  if (unit.bathrooms != null) info.push({ label: t("fields.bathrooms"), value: String(unit.bathrooms) });
  if (unit.base_rent != null) info.push({ label: t("rentLabel"), value: fmt(unit.base_rent) });

  const redirectPath = `/properties/${id}/units/${unitId}`;

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href={`/properties/${id}`}
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-teal-900/60 transition hover:text-brand-teal-900"
      >
        <ArrowIcon className="h-4 w-4 rtl:rotate-180" />
        {tc("back")}
      </Link>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight text-brand-teal-900 sm:text-[28px]">
          {unit.unit_number}
        </h1>
        <UnitStatusBadge status={unit.status} />
        {unit.furnished ? <Badge tone="violet">{t("fields.furnished")}</Badge> : null}
        {unit.has_water_tank ? <Badge tone="teal">{t("hasTank")}</Badge> : null}

        <div className="flex items-center gap-2 sm:ms-auto">
          <Link
            href={`/properties/${id}/units/${unitId}/edit`}
            className="inline-flex items-center gap-2 rounded-xl border border-brand-teal/15 bg-white px-4 py-2.5 text-sm font-bold text-brand-teal-900 shadow-card transition hover:border-brand-teal/35 hover:bg-brand-teal/5"
          >
            <PencilIcon className="h-4 w-4 text-brand-teal" />
            {tc("edit")}
          </Link>
          <DeleteButton
            action={deleteUnitAction}
            id={unitId}
            locale={locale}
            variant="icon"
            extra={{ property_id: id }}
          />
        </div>
      </div>

      {/* تفاصيل */}
      {info.length > 0 ? (
        <div className="mb-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-brand-teal/10 bg-brand-teal/10 shadow-card sm:grid-cols-3 lg:grid-cols-5">
          {info.map((c, i) => (
            <div key={i} className="bg-white px-4 py-3.5">
              <p className="text-xs font-medium text-brand-teal-900/45">{c.label}</p>
              <p className="mt-1 text-sm font-bold text-brand-teal-900" dir="ltr">{c.value}</p>
            </div>
          ))}
        </div>
      ) : null}

      {/* المميزات */}
      {unit.features && unit.features.length > 0 ? (
        <div className="mb-6 rounded-2xl border border-brand-teal/10 bg-white p-5 shadow-card">
          <h2 className="mb-3 text-base font-bold text-brand-teal-900">{t("features")}</h2>
          <div className="flex flex-wrap gap-2">
            {unit.features.map((f, i) => (
              <span key={i} className="rounded-full bg-brand-teal/8 px-3 py-1.5 text-xs font-semibold text-brand-teal-900">
                {f}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {/* صيغة الإعلان */}
      {unit.listing_text ? (
        <div className="mb-6">
          <ListingCopy text={unit.listing_text} />
        </div>
      ) : null}

      {/* الصور */}
      <div className="mb-6">
        <MediaGallery
          organizationId={unit.organization_id}
          entityType="unit"
          entityId={unit.id}
          kind="image"
          title={tmedia("photos")}
          redirectPath={redirectPath}
          locale={locale}
        />
      </div>

      {/* المخطط */}
      <div className="mb-6">
        <MediaGallery
          organizationId={unit.organization_id}
          entityType="unit"
          entityId={unit.id}
          kind="floor_plan"
          title={t("floorPlanTitle")}
          uploadLabel={tmedia("uploadPlan")}
          redirectPath={redirectPath}
          locale={locale}
        />
      </div>

      {/* العدّادات */}
      <div className="mb-6">
        <MetersSection unitId={unit.id} locale={locale} redirectPath={redirectPath} />
      </div>
    </div>
  );
}
