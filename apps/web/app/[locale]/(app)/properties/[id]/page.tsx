import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { PropertyTypeBadge } from "@/components/properties/type-badge";
import { UnitForm } from "@/components/units/unit-form";
import { UnitCard, type UnitCardData } from "@/components/units/unit-card";
import { EmptyState } from "@/components/ui/empty-state";
import { DeleteButton } from "@/components/ui/delete-button";
import { deletePropertyAction } from "@/lib/actions/properties";
import { ArrowIcon, DoorIcon, MapPinIcon, PencilIcon } from "@/components/ui/icons";
import type { Json } from "@ewaan/db";

export const dynamic = "force-dynamic";

function locationText(address: Json | null, nationalAddress: string | null) {
  const a = (address ?? null) as { city?: string | null; district?: string | null } | null;
  const parts = [a?.district, a?.city].filter(Boolean) as string[];
  if (parts.length) return parts.join("، ");
  return nationalAddress ?? null;
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("properties");
  const tu = await getTranslations("units");
  const tc = await getTranslations("common");

  const supabase = await createClient();

  const { data: property } = await supabase
    .from("properties")
    .select("id, name, property_type, address, national_address, deed_number")
    .eq("id", id)
    .maybeSingle();

  if (!property) notFound();

  const { data: units } = await supabase
    .from("units")
    .select("id, unit_number, status, floor, area_sqm, bedrooms, bathrooms, base_rent")
    .eq("property_id", id)
    .order("unit_number", { ascending: true });

  const unitList = (units ?? []) as UnitCardData[];
  const location = locationText(property.address, property.national_address);

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href="/properties"
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-teal-900/60 transition hover:text-brand-teal-900"
      >
        <ArrowIcon className="h-4 w-4 rtl:rotate-180" />
        {t("title")}
      </Link>

      {/* ترويسة العقار */}
      <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-brand-teal-900 sm:text-[28px]">
              {property.name}
            </h1>
            <PropertyTypeBadge type={property.property_type} />
          </div>
          {location ? (
            <p className="mt-1.5 flex items-center gap-1.5 text-sm text-brand-teal-900/55">
              <MapPinIcon className="h-4 w-4 shrink-0" />
              {location}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={`/properties/${id}/edit`}
            className="inline-flex items-center gap-2 rounded-xl border border-brand-teal/15 bg-white px-4 py-2.5 text-sm font-bold text-brand-teal-900 shadow-card transition hover:border-brand-teal/35 hover:bg-brand-teal/5"
          >
            <PencilIcon className="h-4 w-4 text-brand-teal" />
            {tc("edit")}
          </Link>
          <DeleteButton action={deletePropertyAction} id={id} locale={locale} />
        </div>
      </div>

      {/* بطاقة المعلومات */}
      {property.national_address || property.deed_number ? (
        <div className="mb-8 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-brand-teal/10 bg-brand-teal/10 shadow-card sm:grid-cols-2">
          {property.national_address ? (
            <InfoCell label={t("fields.nationalAddress")} value={property.national_address} />
          ) : null}
          {property.deed_number ? (
            <InfoCell label={t("fields.deedNumber")} value={property.deed_number} />
          ) : null}
        </div>
      ) : null}

      {/* قسم الوحدات */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-brand-teal-900">
          {t("detailUnitsTitle")}
          {unitList.length > 0 ? (
            <span className="ms-2 text-sm font-semibold text-brand-teal-900/40">
              {unitList.length}
            </span>
          ) : null}
        </h2>
        {unitList.length > 0 ? <UnitForm propertyId={id} /> : null}
      </div>

      {unitList.length === 0 ? (
        <EmptyState
          icon={<DoorIcon className="h-7 w-7" />}
          title={tu("emptyTitle")}
          body={tu("emptyBody")}
          action={<UnitForm propertyId={id} />}
        />
      ) : (
        <div className="stagger grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {unitList.map((u) => (
            <UnitCard key={u.id} unit={u} locale={locale} propertyId={id} />
          ))}
        </div>
      )}
    </div>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white px-5 py-4">
      <p className="text-xs font-medium text-brand-teal-900/45">{label}</p>
      <p className="mt-1 text-sm font-bold text-brand-teal-900" dir="ltr">
        {value}
      </p>
    </div>
  );
}
