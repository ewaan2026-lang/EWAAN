import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { TenantForm, type TenantInitial } from "@/components/tenants/tenant-form";
import { ArrowIcon } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

export default async function EditTenantPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("tenants");
  const tc = await getTranslations("common");

  const supabase = await createClient();
  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, full_name, phone, email, national_id")
    .eq("id", id)
    .maybeSingle();

  if (!tenant) notFound();

  const initial: TenantInitial = {
    id: tenant.id,
    full_name: tenant.full_name,
    phone: tenant.phone ?? "",
    email: tenant.email ?? "",
    national_id: tenant.national_id ?? "",
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href={`/tenants/${id}`}
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
          <TenantForm initial={initial} />
        </div>
      </div>
    </div>
  );
}
