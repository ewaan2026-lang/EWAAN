"use client";

import { useActionState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { createTenantAction, type TenantState } from "@/lib/actions/tenants";
import { Field, fieldClass } from "@/components/ui/field";

const initialState: TenantState = {};

export function TenantForm() {
  const t = useTranslations("tenants");
  const tc = useTranslations("common");
  const locale = useLocale();
  const action = createTenantAction.bind(null, locale);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <Field label={t("fields.name")} htmlFor="full_name">
        <input
          id="full_name"
          name="full_name"
          required
          autoFocus
          placeholder={t("fields.namePlaceholder")}
          className={fieldClass}
        />
      </Field>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label={t("fields.phone")} htmlFor="phone" hint={tc("optional")}>
          <input id="phone" name="phone" type="tel" dir="ltr" className={`${fieldClass} text-start`} />
        </Field>
        <Field label={t("fields.email")} htmlFor="email" hint={tc("optional")}>
          <input id="email" name="email" type="email" dir="ltr" className={`${fieldClass} text-start`} />
        </Field>
      </div>

      <Field label={t("fields.nationalId")} htmlFor="national_id" hint={tc("optional")}>
        <input id="national_id" name="national_id" dir="ltr" className={`${fieldClass} text-start`} />
      </Field>

      {state.error ? (
        <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {state.error === "name" ? t("errorName") : t("errorGeneric")}
        </p>
      ) : null}

      <div className="pt-1">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-brand-teal px-6 py-2.5 text-[15px] font-bold text-white shadow-card transition hover:bg-brand-teal-700 disabled:opacity-60"
        >
          {pending ? tc("saving") : t("create")}
        </button>
      </div>
    </form>
  );
}
