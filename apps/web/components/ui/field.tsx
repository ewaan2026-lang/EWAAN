import type { ReactNode } from "react";

// أنماط حقول الإدخال الموحّدة (input/select).
export const fieldClass =
  "w-full rounded-xl border border-brand-teal/20 bg-white px-4 py-2.5 text-[15px] text-brand-teal-900 outline-none transition placeholder:text-brand-teal-900/30 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20";

// غلاف حقل: تسمية + تلميح + المحتوى.
export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="flex items-center gap-1.5 text-sm font-medium text-brand-teal-900"
      >
        {label}
        {hint ? (
          <span className="text-xs font-normal text-brand-teal-900/40">
            ({hint})
          </span>
        ) : null}
      </label>
      {children}
    </div>
  );
}
