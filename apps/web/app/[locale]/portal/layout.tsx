import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "@/lib/actions/auth";
import { LanguageSwitcher } from "@/components/app-shell/language-switcher";
import { LogoutIcon } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

export default async function PortalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  const tb = await getTranslations("brand");
  const tp = await getTranslations("portal");
  const tc = await getTranslations("common");
  const signOut = signOutAction.bind(null, locale);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdfbe9] via-brand-cream to-[#f2ecc4]">
      <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-brand-teal/10 bg-white/70 px-4 py-3 backdrop-blur sm:px-8">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-teal text-lg font-extrabold text-brand-gold">
            إ
          </span>
          <div className="leading-tight">
            <p className="text-sm font-bold text-brand-teal-900">{tb("name")}</p>
            <p className="text-[11px] text-brand-teal-900/50">{tp("title")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <LanguageSwitcher />
          <form action={signOut}>
            <button
              type="submit"
              aria-label={tc("signOut")}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-brand-teal-900/50 transition hover:bg-rose-50 hover:text-rose-600"
            >
              <LogoutIcon className="h-[18px] w-[18px] rtl:rotate-180" />
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
