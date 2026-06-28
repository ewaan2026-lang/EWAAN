import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PropertyForm } from "@/components/properties/property-form";
import { ArrowIcon } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

export default async function NewPropertyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("properties");
  const tc = await getTranslations("common");

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/properties"
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-teal-900/60 transition hover:text-brand-teal-900"
      >
        <ArrowIcon className="h-4 w-4 rtl:rotate-180" />
        {tc("back")}
      </Link>

      <div className="overflow-hidden rounded-3xl border border-brand-teal/10 bg-white shadow-card">
        <div className="border-b border-brand-teal/8 bg-gradient-to-l from-brand-teal/5 to-transparent px-7 py-6">
          <h1 className="text-xl font-extrabold text-brand-teal-900">
            {t("newTitle")}
          </h1>
          <p className="mt-1 text-sm text-brand-teal-900/55">
            {t("newSubtitle")}
          </p>
        </div>
        <div className="px-7 py-7">
          <PropertyForm />
        </div>
      </div>
    </div>
  );
}
