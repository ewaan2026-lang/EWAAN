"use client";

import { useActionState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { startPaymentAction, type PayState } from "@/lib/actions/pay";
import { CardIcon } from "@/components/ui/icons";

const initial: PayState = {};

export function PayButton({ scheduleId }: { scheduleId: string }) {
  const t = useTranslations("pay");
  const locale = useLocale();
  const [state, formAction, pending] = useActionState(
    startPaymentAction.bind(null, locale),
    initial,
  );

  const label =
    state.status === "not_configured"
      ? t("notConfigured")
      : state.status === "error"
        ? t("error")
        : pending
          ? t("redirecting")
          : t("payNow");

  return (
    <form action={formAction}>
      <input type="hidden" name="schedule_id" value={scheduleId} />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-1.5 rounded-lg bg-brand-teal px-3 py-1.5 text-xs font-bold text-white transition hover:bg-brand-teal-700 disabled:opacity-60"
      >
        <CardIcon className="h-3.5 w-3.5" />
        {label}
      </button>
    </form>
  );
}
