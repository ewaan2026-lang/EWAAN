"use client";

import { useActionState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { inviteMemberAction, type InviteState } from "@/lib/actions/invite";
import { fieldClass } from "@/components/ui/field";
import { MailIcon } from "@/components/ui/icons";

const initial: InviteState = {};

export function InviteForm() {
  const t = useTranslations("invite");
  const locale = useLocale();
  const [state, formAction, pending] = useActionState(
    inviteMemberAction.bind(null, locale),
    initial,
  );

  const msg =
    state.status === "sent"
      ? { text: t("sent"), cls: "text-emerald-600" }
      : state.status === "skipped"
        ? { text: t("notConfigured"), cls: "text-amber-600" }
        : state.status === "invalid"
          ? { text: t("invalid"), cls: "text-rose-600" }
          : state.status === "error"
            ? { text: t("error"), cls: "text-rose-600" }
            : null;

  return (
    <div className="rounded-2xl border border-brand-teal/10 bg-white p-5 shadow-card">
      <h2 className="mb-1 flex items-center gap-2 text-base font-bold text-brand-teal-900">
        <MailIcon className="h-[18px] w-[18px] text-brand-teal" />
        {t("title")}
      </h2>
      <p className="mb-4 text-sm text-brand-teal-900/55">{t("subtitle")}</p>

      <form action={formAction} className="flex flex-col gap-3 sm:flex-row">
        <input
          name="email"
          type="email"
          required
          dir="ltr"
          placeholder="name@example.com"
          className={`${fieldClass} text-start sm:flex-1`}
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-brand-teal px-5 py-2.5 text-sm font-bold text-white shadow-card transition hover:bg-brand-teal-700 disabled:opacity-60"
        >
          {pending ? t("sending") : t("send")}
        </button>
      </form>

      {msg ? <p className={`mt-3 text-sm font-semibold ${msg.cls}`}>{msg.text}</p> : null}
    </div>
  );
}
