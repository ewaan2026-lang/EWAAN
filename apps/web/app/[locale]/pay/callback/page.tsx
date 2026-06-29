import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchPayment } from "@/lib/moyasar";

export const dynamic = "force-dynamic";

export default async function PayCallbackPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ id?: string; status?: string }>;
}) {
  const { locale } = await params;
  const { id, status } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("pay");

  let paid = false;

  if (id) {
    const payment = await fetchPayment(id);
    if (payment && payment.status === "paid") {
      const scheduleId = payment.metadata?.schedule_id;
      if (scheduleId) {
        const supabase = await createClient();
        await supabase
          .from("payment_schedules")
          .update({ status: "paid" })
          .eq("id", scheduleId);
        paid = true;
      }
    }
  } else if (status === "paid") {
    paid = true;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#fdfbe9] to-[#f2ecc4] px-4">
      <div className="w-full max-w-md rounded-3xl border border-brand-teal/10 bg-white p-8 text-center shadow-luxe">
        <div
          className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl font-extrabold ${
            paid ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
          }`}
        >
          {paid ? "✓" : "!"}
        </div>
        <h1 className="text-xl font-extrabold text-brand-teal-900">
          {paid ? t("successTitle") : t("failedTitle")}
        </h1>
        <p className="mt-2 text-sm text-brand-teal-900/60">
          {paid ? t("successBody") : t("failedBody")}
        </p>
        <Link
          href="/portal"
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-brand-teal px-6 py-2.5 text-sm font-bold text-white shadow-card transition hover:bg-brand-teal-700"
        >
          {t("backToPortal")}
        </Link>
      </div>
    </main>
  );
}
