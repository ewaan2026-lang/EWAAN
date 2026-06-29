"use client";

import { PrinterIcon } from "@/components/ui/icons";

export function PrintButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-xl bg-brand-teal px-5 py-2.5 text-sm font-bold text-white shadow-card transition hover:bg-brand-teal-700 print:hidden"
    >
      <PrinterIcon className="h-4 w-4" />
      {label}
    </button>
  );
}
