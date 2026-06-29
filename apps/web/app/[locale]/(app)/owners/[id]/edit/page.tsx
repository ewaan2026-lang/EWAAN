import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { OwnerForm, type OwnerInitial } from "@/components/owners/owner-form";
import { ArrowIcon } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

export default async function EditOwnerPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("owners");
  const tc = await getTranslations("common");

  const supabase = await createClient();
  const { data: owner } = await supabase
    .from("owners")
    .select("id, full_name, phone, email, national_id, iban, commission_rate, notes")
    .eq("id", id)
    .maybeSingle();

  if (!owner) notFound();

  const initial: OwnerInitial = {
    id: owner.id,
    full_name: owner.full_name,
    phone: owner.phone ?? "",
    email: owner.email ?? "",
    national_id: owner.national_id ?? "",
    iban: owner.iban ?? "",
    commission_rate: owner.commission_rate,
    notes: owner.notes ?? "",
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href={`/owners/${id}`}
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-teal-900/60 transition hover:text-brand-teal-900"
      >
        <ArrowIcon className="h-4 w-4 rtl:rotate-180" />
        {tc("back")}
      </Link>

      <div className="overflow-hidden rounded-3xl border border-brand-teal/10 bg-white shadow-card">
        <div className="border-b border-brand-teal/8 bg-gradient-to-l from-brand-teal/5 to-transparent px-7 py-6">
          <h1 className="text-xl font-extrabold text-brand-teal-900">{t("editTitle")}</h1>
        </div>
        <div className="px-7 py-7">
          <OwnerForm initial={initial} />
        </div>
      </div>
    </div>
  );
}
