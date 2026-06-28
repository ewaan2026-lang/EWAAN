"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Constants } from "@ewaan/db";
import { createUnitAction, type UnitState } from "@/lib/actions/units";
import { Field, fieldClass } from "@/components/ui/field";
import { PlusIcon } from "@/components/ui/icons";

const initialState: UnitState = {};
const unitStatuses = Constants.public.Enums.unit_status;

export function UnitForm({ propertyId }: { propertyId: string }) {
  const t = useTranslations("units");
  const ts = useTranslations("unitStatus");
  const tc = useTranslations("common");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const action = createUnitAction.bind(null, locale, propertyId);
  const [state, formAction, pending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
    }
  }, [state]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl border border-brand-teal/20 bg-white px-4 py-2.5 text-sm font-bold text-brand-teal-900 shadow-card transition hover:border-brand-teal/40 hover:bg-brand-teal/5"
      >
        <PlusIcon className="h-4 w-4" />
        {t("add")}
      </button>
    );
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className="rounded-2xl border border-brand-teal/15 bg-white p-5 shadow-card"
    >
      <h3 className="mb-4 text-base font-bold text-brand-teal-900">
        {t("newTitle")}
      </h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label={t("fields.number")} htmlFor="unit_number">
          <input
            id="unit_number"
            name="unit_number"
            required
            autoFocus
            placeholder={t("fields.numberPlaceholder")}
            className={fieldClass}
          />
        </Field>

        <Field label={t("fields.status")} htmlFor="status">
          <select
            id="status"
            name="status"
            defaultValue="vacant"
            className={fieldClass}
          >
            {unitStatuses.map((s) => (
              <option key={s} value={s}>
                {ts(s)}
              </option>
            ))}
          </select>
        </Field>

        <Field label={t("fields.floor")} htmlFor="floor" hint={tc("optional")}>
          <input id="floor" name="floor" type="number" inputMode="numeric" className={fieldClass} />
        </Field>

        <Field label={t("fields.area")} htmlFor="area_sqm" hint={tc("optional")}>
          <input id="area_sqm" name="area_sqm" type="number" inputMode="decimal" step="0.01" className={fieldClass} />
        </Field>

        <Field label={t("fields.bedrooms")} htmlFor="bedrooms" hint={tc("optional")}>
          <input id="bedrooms" name="bedrooms" type="number" inputMode="numeric" className={fieldClass} />
        </Field>

        <Field label={t("fields.bathrooms")} htmlFor="bathrooms" hint={tc("optional")}>
          <input id="bathrooms" name="bathrooms" type="number" inputMode="numeric" className={fieldClass} />
        </Field>

        <Field label={t("fields.rent")} htmlFor="base_rent" hint={tc("optional")}>
          <input id="base_rent" name="base_rent" type="number" inputMode="decimal" step="0.01" dir="ltr" className={`${fieldClass} text-start`} />
        </Field>

        <label className="flex items-center gap-2.5 self-end pb-2.5 text-sm font-medium text-brand-teal-900">
          <input
            type="checkbox"
            name="furnished"
            className="h-4 w-4 rounded border-brand-teal/30 text-brand-teal focus:ring-brand-teal/30"
          />
          {t("fields.furnished")}
        </label>
      </div>

      {state.error ? (
        <p role="alert" className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {state.error === "number" ? t("errorNumber") : t("errorGeneric")}
        </p>
      ) : null}

      <div className="mt-5 flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-brand-teal px-5 py-2.5 text-sm font-bold text-white shadow-card transition hover:bg-brand-teal-700 disabled:opacity-60"
        >
          {pending ? tc("saving") : t("create")}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-xl px-4 py-2.5 text-sm font-semibold text-brand-teal-900/60 transition hover:bg-brand-teal/5"
        >
          {tc("cancel")}
        </button>
      </div>
    </form>
  );
}
