import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "@/lib/actions/auth";

// صفحات محميّة بالجلسة — تُعرض ديناميكياً لكل طلب (لا تُولَّد مسبقاً وقت البناء).
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

  const t = await getTranslations("nav");
  const tb = await getTranslations("brand");
  const tc = await getTranslations("common");
  const signOut = signOutAction.bind(null, locale);

  const nav = [
    { href: "/dashboard", label: t("overview") },
    { href: "/properties", label: t("properties") },
    { href: "/leases", label: t("leases") },
    { href: "/payments", label: t("payments") },
    { href: "/maintenance", label: t("maintenance") },
    { href: "/settings", label: t("settings") },
  ];

  return (
    <div className="flex min-h-screen bg-brand-cream">
      <aside className="hidden w-64 shrink-0 flex-col border-e border-brand-teal/10 bg-white/60 p-5 md:flex">
        <div className="mb-8 flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-teal text-lg font-extrabold text-brand-gold">
            إ
          </span>
          <span className="text-lg font-extrabold text-brand-teal-900">{tb("name")}</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2.5 text-[15px] font-medium text-brand-teal-900/70 transition hover:bg-brand-teal/5 hover:text-brand-teal-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <form action={signOut}>
          <button
            type="submit"
            className="w-full rounded-lg px-3 py-2.5 text-start text-[15px] font-medium text-brand-teal-900/60 transition hover:bg-red-50 hover:text-red-700"
          >
            {tc("signOut")}
          </button>
        </form>
      </aside>

      <main className="flex-1 px-5 py-8 md:px-10">{children}</main>
    </div>
  );
}
