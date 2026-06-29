"use client";

import { useActionState } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  sendPaymentReminderAction,
  type ReminderState,
} from "@/lib/actions/notifications";
import { BellIcon } from "@/components/ui/icons";

const initial: ReminderState = {};

export function ReminderButton({ scheduleId }: { scheduleId: string }) {
  const t = useTranslations("notifications");
  const locale = useLocale();
  const [state, formAction, pending] = useActionState(
    sendPaymentReminderAction.bind(null, locale),
    initial,
  );

  const tone =
    state.status === "sent"
      ? "text-emerald-600"
      : state.status === "skipped" || state.status === "no_email"
        ? "text-amber-600"
        : state.status === "error"
          ? "text-rose-600"
          : "text-brand-teal-900/60";

  const label =
    state.status === "sent"
      ? t("sent")
      : state.status === "skipped"
        ? t("notConfigured")
        : state.status === "no_email"
          ? t("noEmail")
          : state.status === "error"
            ? t("failed")
            : t("remind");

  return (
    <form action={formAction}>
      <input type="hidden" name="schedule_id" value={scheduleId} />
      <button
        type="submit"
        disabled={pending}
        title={t("remind")}
        className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition hover:bg-brand-teal/5 disabled:opacity-60 ${tone}`}
      >
        <BellIcon className="h-3.5 w-3.5" />
        {pending ? "…" : label}
      </button>
    </form>
  );
}
