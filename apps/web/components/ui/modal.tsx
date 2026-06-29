"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { CloseIcon } from "@/components/ui/icons";

// نافذة منبثقة (modal) تُعرض عبر portal خارج أي فورم — لتجنّب تداخل النماذج.
export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[2000] flex items-start justify-center overflow-y-auto bg-brand-night/50 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        dir="inherit"
        className="rise relative my-8 w-full max-w-lg rounded-3xl border border-brand-teal/10 bg-white p-6 shadow-luxe sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="pointer-events-none absolute inset-x-0 top-0 h-1 rounded-t-3xl bg-gradient-to-r from-brand-gold via-brand-brass to-brand-gold opacity-90" />
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-lg font-extrabold text-brand-teal-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="close"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-brand-teal-900/45 transition hover:bg-brand-teal/5 hover:text-brand-teal-900"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
