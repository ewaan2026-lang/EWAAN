import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { ReceiptIcon, PlusIcon } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

const STATUS_TONE: Record<string, "teal" | "green" | "amber" | "rose" | "slate"> = {
  draft: "slate",
  issued: "teal",
  paid: "green",
  partially_paid: "amber",
  overdue: "rose",
  cancelled: "slate",
};

export default async function InvoicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("invoices");
  const intlLocale = locale === "ar" ? "ar-SA-u-nu-latn" : "en-US";

  const supabase = await createClient();
  const [{ data: invoices }, { data: tenants }] = await Promise.all([
    supabase
      .from("invoices")
      .select("id, invoice_number, total, status, issue_date, tenant_id, type")
      .order("issue_date", { ascending: false }),
    supabase.from("tenants").select("id, full_name"),
  ]);

  const tenantName = new Map((tenants ?? []).map((x) => [x.id, x.full_name]));
  const rows = invoices ?? [];

  const fmt = (n: number) =>
    new Intl.NumberFormat(intlLocale, {
      style: "currency",
      currency: "SAR",
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        action={
          <Link
            href="/invoices/new"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-teal px-5 py-2.5 text-sm font-bold text-white shadow-card transition hover:bg-brand-teal-700"
          >
            <PlusIcon className="h-4 w-4" />
            {t("new")}
          </Link>
        }
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={<ReceiptIcon className="h-7 w-7" />}
          title={t("emptyTitle")}
          body={t("emptyBody")}
        />
      ) : (
        <div className="relative overflow-hidden rounded-2xl border border-brand-teal/10 bg-white shadow-luxe">
          <span className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-gold via-brand-brass to-brand-gold opacity-90" />
          {rows.map((r, i) => (
            <Link
              key={r.id}
              href={`/invoices/${r.id}`}
              className={`flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 transition hover:bg-brand-teal/5 ${
                i > 0 ? "border-t border-brand-teal/8" : ""
              }`}
            >
              <div className="min-w-0">
                <p className="text-sm font-extrabold text-brand-teal-900" dir="ltr">
                  {r.invoice_number}
                </p>
                <p className="truncate text-xs text-brand-teal-900/50">
                  {tenantName.get(r.tenant_id ?? "") ?? "—"} · {t(`types.${r.type}`)} ·{" "}
                  <span dir="ltr">{r.issue_date}</span>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-brand-teal-900" dir="ltr">
                  {fmt(r.total)}
                </span>
                <Badge tone={STATUS_TONE[r.status] ?? "slate"}>
                  {t(`statusLabel.${r.status}`)}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
