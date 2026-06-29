import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { ArrowIcon } from "@/components/ui/icons";
import { QrImage } from "@/components/invoices/qr-image";
import { PrintButton } from "@/components/invoices/print-button";

export const dynamic = "force-dynamic";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("invoices");
  const intlLocale = locale === "ar" ? "ar-SA-u-nu-latn" : "en-US";

  const supabase = await createClient();
  const { data: invoice } = await supabase
    .from("invoices")
    .select(
      "id, invoice_number, type, status, issue_date, due_date, subtotal, tax_amount, total, notes, organization_id, tenant_id, zatca_qr",
    )
    .eq("id", id)
    .maybeSingle();

  if (!invoice) notFound();

  const [{ data: org }, { data: tenant }] = await Promise.all([
    supabase
      .from("organizations")
      .select("name, legal_name, vat_number, cr_number, phone, email")
      .eq("id", invoice.organization_id)
      .maybeSingle(),
    invoice.tenant_id
      ? supabase
          .from("tenants")
          .select("full_name, phone")
          .eq("id", invoice.tenant_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const fmt = (n: number) =>
    new Intl.NumberFormat(intlLocale, {
      style: "currency",
      currency: "SAR",
      maximumFractionDigits: 2,
    }).format(n);

  const sellerName = org?.legal_name || org?.name || "—";

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-5 flex items-center justify-between gap-3 no-print">
        <Link
          href="/invoices"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-teal-900/60 transition hover:text-brand-teal-900"
        >
          <ArrowIcon className="h-4 w-4 rtl:rotate-180" />
          {t("title")}
        </Link>
        <PrintButton label={t("print")} />
      </div>

      {/* مستند الفاتورة */}
      <div className="relative overflow-hidden rounded-2xl border border-brand-teal/10 bg-white p-7 shadow-luxe print:border-0 print:shadow-none sm:p-9">
        <span className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-brand-gold via-brand-brass to-brand-gold print:hidden" />

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-brand-teal-900">{sellerName}</h1>
            {org?.vat_number ? (
              <p className="mt-1 text-xs text-brand-teal-900/60" dir="ltr">
                {t("vatNumber")}: {org.vat_number}
              </p>
            ) : null}
            {org?.cr_number ? (
              <p className="text-xs text-brand-teal-900/60" dir="ltr">
                CR: {org.cr_number}
              </p>
            ) : null}
          </div>
          <div className="text-end">
            <p className="text-sm font-extrabold text-brand-teal-900">
              {t("simplifiedTaxInvoice")}
            </p>
            <p className="mt-1 text-sm font-bold text-brand-teal-900" dir="ltr">
              {invoice.invoice_number}
            </p>
          </div>
        </div>

        <div className="my-6 h-px bg-brand-teal/10" />

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs font-medium text-brand-teal-900/45">{t("buyer")}</p>
            <p className="mt-0.5 font-bold text-brand-teal-900">{tenant?.full_name ?? "—"}</p>
            {tenant?.phone ? (
              <p className="text-xs text-brand-teal-900/60" dir="ltr">
                {tenant.phone}
              </p>
            ) : null}
          </div>
          <div className="text-end">
            <p className="text-xs font-medium text-brand-teal-900/45">{t("issueDateLabel")}</p>
            <p className="mt-0.5 font-bold text-brand-teal-900" dir="ltr">
              {invoice.issue_date}
            </p>
            {invoice.due_date ? (
              <>
                <p className="mt-1.5 text-xs font-medium text-brand-teal-900/45">
                  {t("dueDateLabel")}
                </p>
                <p className="font-bold text-brand-teal-900" dir="ltr">
                  {invoice.due_date}
                </p>
              </>
            ) : null}
          </div>
        </div>

        {/* البنود */}
        <div className="mt-6 overflow-hidden rounded-xl border border-brand-teal/10">
          <div className="flex items-center justify-between bg-brand-teal/[0.06] px-4 py-2.5 text-xs font-bold text-brand-teal-900/70">
            <span>{t("descriptionLabel")}</span>
            <span>{t("totalLabel")}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3 text-sm">
            <span className="text-brand-teal-900">
              {t(`types.${invoice.type}`)}
              {invoice.notes ? (
                <span className="text-brand-teal-900/50"> — {invoice.notes}</span>
              ) : null}
            </span>
            <span className="font-bold text-brand-teal-900" dir="ltr">
              {fmt(invoice.subtotal)}
            </span>
          </div>
        </div>

        {/* الإجماليات */}
        <div className="mt-5 ms-auto max-w-xs space-y-2 text-sm">
          <div className="flex items-center justify-between text-brand-teal-900/70">
            <span>{t("subtotalLabel")}</span>
            <span dir="ltr">{fmt(invoice.subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-brand-teal-900/70">
            <span>{t("taxLabel")}</span>
            <span dir="ltr">{fmt(invoice.tax_amount)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-brand-teal/15 pt-2 text-base font-extrabold text-brand-teal-900">
            <span>{t("totalLabel")}</span>
            <span dir="ltr">{fmt(invoice.total)}</span>
          </div>
        </div>

        {/* QR */}
        {invoice.zatca_qr ? (
          <div className="mt-7 flex flex-col items-center border-t border-brand-teal/10 pt-6">
            <QrImage value={invoice.zatca_qr} size={140} />
            <p className="mt-2 text-[11px] font-medium text-brand-teal-900/45">{t("qrNote")}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
