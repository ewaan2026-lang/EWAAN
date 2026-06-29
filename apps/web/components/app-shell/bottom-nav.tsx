"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { NAV, PRIMARY_KEYS } from "./nav-items";

export function BottomNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const items = PRIMARY_KEYS.map((k) => NAV.find((n) => n.key === k)!).filter(
    Boolean,
  );

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-brand-teal/10 bg-white/95 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-lg items-stretch justify-around">
        {items.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-1 px-1 pb-2 pt-2.5 text-[10px] font-bold transition ${
                active ? "text-brand-teal" : "text-brand-teal-900/45"
              }`}
            >
              <span
                className={`flex h-8 w-12 items-center justify-center rounded-lg transition ${
                  active ? "bg-brand-teal/10" : ""
                }`}
              >
                <item.Icon className="h-5 w-5" />
              </span>
              {t(item.key)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
