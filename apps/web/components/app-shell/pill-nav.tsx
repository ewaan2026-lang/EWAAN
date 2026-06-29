"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { NAV } from "./nav-items";

// شريط تنقّل بأقراص (pills) قابل للسحب أفقياً — لتجربة الموبايل.
export function PillNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const scrollerRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  // توسيط القرص النشط عند تغيّر الصفحة.
  useEffect(() => {
    const el = scrollerRef.current;
    const active = el?.querySelector<HTMLElement>('[data-active="true"]');
    active?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [pathname]);

  // سحب بالماوس (اللمس يعتمد التمرير الأصلي).
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    let down = false;
    let startX = 0;
    let startScroll = 0;
    let moved = false;

    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      down = true;
      moved = false;
      startX = e.clientX;
      startScroll = el.scrollLeft;
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      el.scrollLeft = startScroll - dx;
    };
    const onUp = () => {
      down = false;
    };
    // منع تفعيل الرابط إذا كان المستخدم يسحب.
    const onClick = (e: MouseEvent) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
        moved = false;
      }
    };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointerleave", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("click", onClick, true);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointerleave", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("click", onClick, true);
    };
  }, []);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-brand-teal/10 bg-white/95 backdrop-blur md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-gold/50 to-transparent" />
      <div
        ref={scrollerRef}
        className="no-scrollbar flex items-center gap-2 overflow-x-auto px-3 py-2.5"
        style={{ scrollbarWidth: "none", touchAction: "pan-x", cursor: "grab" }}
      >
        {NAV.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              data-active={active ? "true" : undefined}
              className={`flex shrink-0 select-none items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all duration-300 ${
                active
                  ? "bg-gradient-to-br from-brand-teal to-brand-teal-900 text-white shadow-gold ring-1 ring-brand-gold/40"
                  : "bg-brand-teal/[0.06] text-brand-teal-900/55 hover:bg-brand-teal/10"
              }`}
            >
              <item.Icon className="h-[18px] w-[18px] shrink-0" />
              {t(item.key)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
