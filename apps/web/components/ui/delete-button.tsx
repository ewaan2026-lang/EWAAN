"use client";

import { useTranslations } from "next-intl";
import { TrashIcon } from "@/components/ui/icons";

// زر حذف قابل لإعادة الاستخدام مع تأكيد. يستقبل إجراء خادم مربوطاً.
export function DeleteButton({
  action,
  id,
  locale,
  label,
  variant = "button",
  extra,
}: {
  action: (formData: FormData) => void;
  id: string;
  locale: string;
  label?: string;
  variant?: "button" | "icon";
  extra?: Record<string, string>;
}) {
  const tc = useTranslations("common");

  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(tc("deleteConfirm"))) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="locale" value={locale} />
      {extra
        ? Object.entries(extra).map(([k, v]) => (
            <input key={k} type="hidden" name={k} value={v} />
          ))
        : null}
      {variant === "icon" ? (
        <button
          type="submit"
          aria-label={tc("delete")}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-brand-teal-900/45 transition hover:bg-rose-50 hover:text-rose-600"
        >
          <TrashIcon className="h-[18px] w-[18px]" />
        </button>
      ) : (
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-bold text-rose-600 transition hover:bg-rose-50"
        >
          <TrashIcon className="h-4 w-4" />
          {label ?? tc("delete")}
        </button>
      )}
    </form>
  );
}
