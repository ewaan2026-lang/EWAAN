"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { GlobeIcon } from "@/components/ui/icons";

// مبدّل اللغة — يحافظ على نفس الصفحة عند التبديل.
export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const other = locale === "ar" ? "en" : "ar";

  return (
    <button
      type="button"
      onClick={() => router.replace(pathname, { locale: other })}
      className="inline-flex items-center gap-1.5 rounded-lg border border-brand-teal/15 bg-white px-2.5 py-1.5 text-xs font-bold text-brand-teal-900 transition hover:border-brand-teal/35 hover:bg-brand-teal/5"
      aria-label="Switch language"
    >
      <GlobeIcon className="h-4 w-4 text-brand-teal" />
      {locale === "ar" ? "EN" : "ع"}
    </button>
  );
}
