"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export function ListingCopy({ text }: { text: string }) {
  const t = useTranslations("units");
  const [copied, setCopied] = useState(false);

  return (
    <div className="rounded-2xl border border-brand-teal/10 bg-white p-5 shadow-card">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-base font-bold text-brand-teal-900">{t("listing")}</h2>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="rounded-lg bg-brand-teal/10 px-3 py-1.5 text-xs font-bold text-brand-teal-900 transition hover:bg-brand-teal hover:text-white"
        >
          {copied ? t("copied") : t("copy")}
        </button>
      </div>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-brand-teal-900/70">
        {text}
      </p>
    </div>
  );
}
