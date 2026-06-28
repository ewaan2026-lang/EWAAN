"use client";

import { useActionState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { createOrgAction, type AuthState } from "@/lib/actions/auth";

const initialState: AuthState = {};

export function CreateOrgForm() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const action = createOrgAction.bind(null, locale);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="name" className="block text-sm font-medium text-brand-teal-900">
          {t("orgNameLabel")}
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="w-full rounded-xl border border-brand-teal/20 bg-white px-4 py-3 outline-none transition focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20"
        />
      </div>
      {state.error ? (
        <p role="alert" className="text-sm text-red-700">
          {t("noOrgSubtitle")}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-brand-teal py-3 font-bold text-white shadow-card transition hover:bg-brand-teal-700 disabled:opacity-60"
      >
        {pending ? t("creating") : t("createOrg")}
      </button>
    </form>
  );
}
