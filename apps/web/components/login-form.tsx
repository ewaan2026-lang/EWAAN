"use client";

import { useActionState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { signInAction, type AuthState } from "@/lib/actions/auth";

const initialState: AuthState = {};

export function LoginForm() {
  const t = useTranslations();
  const locale = useLocale();
  const action = signInAction.bind(null, locale);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-sm font-medium text-brand-teal-900">
          {t("common.email")}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          dir="ltr"
          className="w-full rounded-xl border border-brand-teal/20 bg-white px-4 py-3 text-start text-[15px] outline-none transition focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-sm font-medium text-brand-teal-900">
          {t("common.password")}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          dir="ltr"
          className="w-full rounded-xl border border-brand-teal/20 bg-white px-4 py-3 text-start text-[15px] outline-none transition focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20"
        />
      </div>

      {state.error ? (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error === "invalid" ? t("login.errorInvalid") : t("login.errorGeneric")}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-brand-teal py-3 text-[15px] font-bold text-white shadow-card transition hover:bg-brand-teal-700 disabled:opacity-60"
      >
        {pending ? t("common.loading") : t("login.submit")}
      </button>

      <p className="text-center text-[13px] leading-relaxed text-brand-teal-900/60">
        {t("login.noAccountHint")}
      </p>
    </form>
  );
}
