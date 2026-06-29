import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { UnitForm, type UnitInitial } from "@/components/units/unit-form";
import { ArrowIcon } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

export default async function EditUnitPage({
  params,
}: {
  params: Promise<{ locale: string; id: string; unitId: string }>;
}) {
  const { locale, id, unitId } = await params;
  setRequestLocale(locale);
  const tc = await getTranslations("common");

  const supabase = await createClient();
  const { data: unit } = await supabase
    .from("units")
    .select("id, unit_number, status, floor, area_sqm, bedrooms, bathrooms, base_rent, furnished, features, listing_text, has_water_tank")
    .eq("id", unitId)
    .maybeSingle();

  if (!unit) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href={`/properties/${id}`}
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-teal-900/60 transition hover:text-brand-teal-900"
      >
        <ArrowIcon className="h-4 w-4 rtl:rotate-180" />
        {tc("back")}
      </Link>

      <UnitForm propertyId={id} initial={unit as UnitInitial} />
    </div>
  );
}
