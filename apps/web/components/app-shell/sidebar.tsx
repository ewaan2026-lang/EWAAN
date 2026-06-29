"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { NAV } from "./nav-items";
import { LogoutIcon } from "@/components/ui/icons";

export function Sidebar({
  brandName,
  orgName,
  signOut,
  signOutLabel,
}: {
  brandName: string;
  orgName: string;
  signOut: () => void;
  signOutLabel: string;
}) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside className="no-print sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-gradient-to-b from-brand-teal-900 to-brand-teal text-white md:flex">
      {/* العلامة */}
      <div className="flex items-center gap-3 px-5 pb-6 pt-6">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-xl font-extrabold text-brand-gold ring-1 ring-white/15">
          إ
        </span>
        <div className="leading-tight">
          <p className="text-[15px] font-extrabold">{brandName}</p>
          <p className="truncate text-[11px] text-white/55">{orgName}</p>
        </div>
      </div>

      {/* التنقّل */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3">
        {NAV.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-semibold transition ${
                active
                  ? "bg-white/15 text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              {active ? (
                <span className="absolute inset-y-2 start-0 w-1 rounded-full bg-brand-gold" />
              ) : null}
              <item.Icon
                className={`h-[18px] w-[18px] transition ${
                  active ? "text-brand-gold" : "text-white/60 group-hover:text-white"
                }`}
              />
              {t(item.key)}
            </Link>
          );
        })}
      </nav>

      {/* تسجيل الخروج */}
      <div className="border-t border-white/10 p-3">
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <LogoutIcon className="h-[18px] w-[18px] rtl:rotate-180" />
            {signOutLabel}
          </button>
        </form>
      </div>
    </aside>
  );
}
