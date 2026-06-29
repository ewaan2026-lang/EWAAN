"use client";

import { useActionState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  createOwnerAction,
  updateOwnerAction,
  type OwnerState,
} from "@/lib/actions/owners";
import { Field, fieldClass } from "@/components/ui/field";

const initialState: OwnerState = {};

export type OwnerInitial = {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  national_id: string;
  iban: string;
  commission_rate: number | null;
  notes: string;
};

export function OwnerForm({
  initial,
  onCreated,
}: {
  initial?: OwnerInitial;
  onCreated?: (o: { id: string; label: string }) => void;
}) {
  const t = useTranslations("owners");
  const tc = useTranslations("common");
  const locale = useLocale();
  const action = initial
    ? updateOwnerAction.bind(null, locale, initial.id)
    : createOwnerAction.bind(null, locale);
  const [state, formAction, pending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.created && onCreated) onCreated(state.created);
  }, [state.created, onCreated]);

  return (
    <form action={formAction} className="space-y-5">
      {onCreated ? <input type="hidden" name="__modal" value="1" /> : null}
      <Field label={t("fields.name")} htmlFor="full_name">
        <input
          id="full_name"
          name="full_name"
          required
          autoFocus
          defaultValue={initial?.full_name}
          placeholder={t("fields.namePlaceholder")}
          className={fieldClass}
        />
      </Field>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label={t("fields.phone")} htmlFor="phone" hint={tc("optional")}>
          <input id="phone" name="phone" type="tel" dir="ltr" defaultValue={initial?.phone} className={`${fieldClass} text-start`} />
        </Field>
        <Field label={t("fields.email")} htmlFor="email" hint={tc("optional")}>
          <input id="email" name="email" type="email" dir="ltr" defaultValue={initial?.email} className={`${fieldClass} text-start`} />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label={t("fields.nationalId")} htmlFor="national_id" hint={tc("optional")}>
          <input id="national_id" name="national_id" dir="ltr" defaultValue={initial?.national_id} className={`${fieldClass} text-start`} />
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
            defaultValue={initial?.commission_rate ?? undefined}
            className={`${fieldClass} text-start`}
          />
        </Field>
      </div>

      <Field label={t("fields.iban")} htmlFor="iban" hint={tc("optional")}>
        <input id="iban" name="iban" dir="ltr" defaultValue={initial?.iban} placeholder="SA…" className={`${fieldClass} text-start`} />
      </Field>

      <Field label={t("fields.notes")} htmlFor="notes" hint={tc("optional")}>
        <textarea id="notes" name="notes" rows={3} defaultValue={initial?.notes} className={`${fieldClass} resize-none`} />
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
          {pending ? tc("saving") : initial ? tc("saveChanges") : t("create")}
        </button>
      </div>
    </form>
  );
}
