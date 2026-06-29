import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "@/components/login-form";
import { LanguageSwitcher } from "@/components/app-shell/language-switcher";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect(`/${locale}/dashboard`);

  const t = await getTranslations({ locale, namespace: "brand" });
  const tl = await getTranslations({ locale, namespace: "login" });
  const tn = await getTranslations({ locale, namespace: "nav" });

  const chips = ["properties", "leases", "payments", "maintenance", "owners", "tenants"];

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* اللوحة التعريفية (سطح المكتب) */}
      <section className="gradient-pan relative hidden overflow-hidden bg-gradient-to-br from-brand-teal-900 via-brand-teal-900 to-brand-teal p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="float-slow pointer-events-none absolute -end-24 -top-24 h-80 w-80 rounded-full bg-brand-teal/40 blur-3xl" />
        <div className="float-slower pointer-events-none absolute -bottom-24 -start-16 h-72 w-72 rounded-full bg-brand-brass/20 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-2xl font-extrabold text-brand-gold ring-1 ring-white/20">
            إ
          </span>
          <span className="text-xl font-extrabold">{t("name")}</span>
        </div>

        <div className="relative">
          <h2 className="max-w-md text-3xl font-extrabold leading-snug">
            {t("tagline")}
          </h2>
          <div className="mt-7 flex flex-wrap gap-2">
            {chips.map((c) => (
              <span
                key={c}
                className="rounded-full bg-white/10 px-3.5 py-1.5 text-sm font-semibold text-white/85 ring-1 ring-white/15"
              >
                {tn(c)}
              </span>
            ))}
          </div>
        </div>

        <div className="relative h-px w-24 bg-gradient-to-r from-brand-gold/80 to-transparent" />
      </section>

      {/* لوحة الدخول */}
      <section className="relative flex items-center justify-center bg-gradient-to-br from-[#fdfbe9] to-[#f2ecc4] px-4 py-12">
        <div className="absolute end-4 top-4">
          <LanguageSwitcher />
        </div>

        <div className="w-full max-w-md">
          {/* العلامة على الجوال */}
          <div className="mb-8 text-center lg:hidden">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-teal text-2xl font-extrabold text-brand-gold shadow-card">
              إ
            </div>
            <h1 className="text-2xl font-extrabold text-brand-teal-900">{t("name")}</h1>
            <p className="mt-1 text-sm text-brand-teal-900/60">{t("tagline")}</p>
          </div>

          <div className="rounded-3xl border border-brand-teal/10 bg-white/80 p-7 shadow-card backdrop-blur sm:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-extrabold text-brand-teal-900">{tl("title")}</h2>
              <p className="mt-1 text-sm text-brand-teal-900/60">{tl("subtitle")}</p>
            </div>
            <LoginForm />
          </div>
        </div>
      </section>
    </main>
  );
}
