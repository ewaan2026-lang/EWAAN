import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { ArrowIcon } from "@/components/ui/icons";
import { InvoiceForm, type LeaseOpt } from "@/components/invoices/invoice-form";

export const dynamic = "force-dynamic";

export default async function NewInvoicePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("invoices");

  const supabase = await createClient();
  const [{ data: tenants }, { data: leases }] = await Promise.all([
    supabase.from("tenants").select("id, full_name").order("full_name"),
    supabase
      .from("leases")
      .select("id, contract_number")
      .order("start_date", { ascending: false }),
  ]);

  const leaseOpts: LeaseOpt[] = (leases ?? []).map((l) => ({
    id: l.id,
    label: l.contract_number ?? `#${l.id.slice(0, 8)}`,
  }));

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/invoices"
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-teal-900/60 transition hover:text-brand-teal-900"
      >
        <ArrowIcon className="h-4 w-4 rtl:rotate-180" />
        {t("title")}
      </Link>

      <div className="mb-7 flex items-center gap-3.5">
        <span className="h-9 w-1 shrink-0 rounded-full bg-gradient-to-b from-brand-gold to-brand-brass" />
        <h1 className="text-2xl font-extrabold tracking-tight text-brand-teal-900 sm:text-[28px]">
          {t("new")}
        </h1>
      </div>

      <div className="rounded-2xl border border-brand-teal/10 bg-white p-6 shadow-card sm:p-7">
        <InvoiceForm tenants={tenants ?? []} leases={leaseOpts} today={today} />
      </div>
    </div>
  );
}
