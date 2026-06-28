import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "@/components/login-form";

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

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-cream px-4 py-12">
      <div className="w-full max-w-md">
        {/* العلامة */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-teal text-2xl font-extrabold text-brand-gold">
            إ
          </div>
          <h1 className="text-2xl font-extrabold text-brand-teal-900">{t("name")}</h1>
          <p className="mt-1 text-sm text-brand-teal-900/60">{t("tagline")}</p>
        </div>

        <div className="rounded-2xl border border-brand-teal/10 bg-white/70 p-7 shadow-card backdrop-blur">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-brand-teal-900">{tl("title")}</h2>
            <p className="mt-1 text-sm text-brand-teal-900/60">{tl("subtitle")}</p>
          </div>
          <LoginForm />
        </div>

        {/* خيط ذهبي توقيعي */}
        <div className="mx-auto mt-8 h-px w-24 bg-gradient-to-r from-transparent via-brand-brass to-transparent" />
      </div>
    </main>
  );
}
