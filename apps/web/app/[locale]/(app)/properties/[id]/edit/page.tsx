import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  PropertyForm,
  type PropertyInitial,
} from "@/components/properties/property-form";
import { ArrowIcon } from "@/components/ui/icons";
import type { Json } from "@ewaan/db";

export const dynamic = "force-dynamic";

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("properties");
  const tc = await getTranslations("common");

  const supabase = await createClient();
  const [{ data: property }, { data: owners }] = await Promise.all([
    supabase
      .from("properties")
      .select("id, name, property_type, address, national_address, deed_number, owner_id, services, whatsapp_group_url, latitude, longitude")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("owners").select("id, full_name").order("full_name"),
  ]);

  if (!property) notFound();

  const addr = (property.address ?? null) as
    | { city?: string | null; district?: string | null }
    | null;

  const initial: PropertyInitial = {
    id: property.id,
    name: property.name,
    property_type: property.property_type,
    city: addr?.city ?? "",
    district: addr?.district ?? "",
    national_address: property.national_address ?? "",
    deed_number: property.deed_number ?? "",
    owner_id: property.owner_id ?? "",
    services: property.services ?? [],
    whatsapp_group_url: property.whatsapp_group_url ?? "",
    latitude: property.latitude ?? null,
    longitude: property.longitude ?? null,
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href={`/properties/${id}`}
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-teal-900/60 transition hover:text-brand-teal-900"
      >
        <ArrowIcon className="h-4 w-4 rtl:rotate-180" />
        {tc("back")}
      </Link>

      <div className="overflow-hidden rounded-3xl border border-brand-teal/10 bg-white shadow-card">
        <div className="border-b border-brand-teal/8 bg-gradient-to-l from-brand-teal/5 to-transparent px-7 py-6">
          <h1 className="text-xl font-extrabold text-brand-teal-900">
            {t("editTitle")}
          </h1>
        </div>
        <div className="px-7 py-7">
          <PropertyForm owners={owners ?? []} initial={initial} />
        </div>
      </div>
    </div>
  );
}
