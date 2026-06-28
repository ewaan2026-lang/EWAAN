"use client";

import { useActionState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { createOwnerAction, type OwnerState } from "@/lib/actions/owners";
import { Field, fieldClass } from "@/components/ui/field";

const initialState: OwnerState = {};

export function OwnerForm() {
  const t = useTranslations("owners");
  const tc = useTranslations("common");
  const locale = useLocale();
  const action = createOwnerAction.bind(null, locale);
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

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label={t("fields.nationalId")} htmlFor="national_id" hint={tc("optional")}>
          <input id="national_id" name="national_id" dir="ltr" className={`${fieldClass} text-start`} />
        </Field>
        <Field label={t("fields.commission")} htmlFor="commission_rate" hint={tc("optional")}>
          <input
            id="commission_rate"
            name="commission_rate"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            max="100"
            dir="ltr"
            className={`${fieldClass} text-start`}
          />
        </Field>
      </div>

      <Field label={t("fields.iban")} htmlFor="iban" hint={tc("optional")}>
        <input id="iban" name="iban" dir="ltr" placeholder="SA…" className={`${fieldClass} text-start`} />
      </Field>

      <Field label={t("fields.notes")} htmlFor="notes" hint={tc("optional")}>
        <textarea id="notes" name="notes" rows={3} className={`${fieldClass} resize-none`} />
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
