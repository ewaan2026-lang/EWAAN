import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrgId } from "@/lib/org";
import { signOutAction } from "@/lib/actions/auth";
import { Link } from "@/i18n/navigation";
import { Sidebar } from "@/components/app-shell/sidebar";
import { PillNav } from "@/components/app-shell/pill-nav";
import { LanguageSwitcher } from "@/components/app-shell/language-switcher";
import { LogoutIcon, BellIcon } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

export default async function AppLayout({
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

  const orgId = await getActiveOrgId();
  let orgName = "";
  if (orgId) {
    const { data } = await supabase
      .from("organizations")
      .select("name")
      .eq("id", orgId)
      .maybeSingle();
    orgName = data?.name ?? "";
  }

  const tb = await getTranslations("brand");
  const tc = await getTranslations("common");
  const brandName = tb("name");
  const signOut = signOutAction.bind(null, locale);
  const email = user.email ?? "";
  const initials = email.slice(0, 2).toUpperCase();

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#fdfbe9] via-brand-cream to-[#f2ecc4]">
      <Sidebar
        brandName={brandName}
        orgName={orgName}
        signOut={signOut}
        signOutLabel={tc("signOut")}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* الشريط العلوي */}
        <header className="no-print sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-brand-teal/10 bg-white/70 px-4 py-3 backdrop-blur md:px-8">
          <div className="flex min-w-0 items-center gap-2.5">
            {/* العلامة على الجوال */}
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-teal text-lg font-extrabold text-brand-gold md:hidden">
              إ
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-brand-teal-900">
                <span className="md:hidden">{brandName}</span>
                <span className="hidden md:inline">{orgName || brandName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <LanguageSwitcher />
            <Link
              href="/alerts"
              aria-label="alerts"
              className="hidden h-9 w-9 items-center justify-center rounded-lg text-brand-teal-900/40 transition hover:bg-brand-teal/5 hover:text-brand-teal sm:flex"
            >
              <BellIcon className="h-[18px] w-[18px]" />
            </Link>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-teal to-brand-teal-900 text-xs font-extrabold text-white" dir="ltr">
              {initials}
            </span>
            <form action={signOut} className="md:hidden">
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

        <main className="flex-1 px-4 pb-24 pt-7 sm:px-6 md:px-8 md:pb-10">
          {children}
        </main>
      </div>

      <PillNav />
    </div>
  );
}
