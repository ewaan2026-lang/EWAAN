"use client";

import { useActionState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Constants } from "@ewaan/db";
import {
  createPropertyAction,
  type PropertyState,
} from "@/lib/actions/properties";
import { Field, fieldClass } from "@/components/ui/field";

const initialState: PropertyState = {};
const propertyTypes = Constants.public.Enums.property_type;

export function PropertyForm() {
  const t = useTranslations("properties");
  const tp = useTranslations("propertyTypes");
  const tc = useTranslations("common");
  const locale = useLocale();
  const action = createPropertyAction.bind(null, locale);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <Field label={t("fields.name")} htmlFor="name">
        <input
          id="name"
          name="name"
          required
          autoFocus
          placeholder={t("fields.namePlaceholder")}
          className={fieldClass}
        />
      </Field>

      <Field label={t("fields.type")} htmlFor="property_type">
        <select
          id="property_type"
          name="property_type"
          defaultValue="residential_building"
          className={fieldClass}
        >
          {propertyTypes.map((tp_) => (
            <option key={tp_} value={tp_}>
              {tp(tp_)}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label={t("fields.city")} htmlFor="city" hint={tc("optional")}>
          <input
            id="city"
            name="city"
            placeholder={t("fields.cityPlaceholder")}
            className={fieldClass}
          />
        </Field>
        <Field
          label={t("fields.district")}
          htmlFor="district"
          hint={tc("optional")}
        >
          <input
            id="district"
            name="district"
            placeholder={t("fields.districtPlaceholder")}
            className={fieldClass}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field
          label={t("fields.nationalAddress")}
          htmlFor="national_address"
          hint={tc("optional")}
        >
          <input
            id="national_address"
            name="national_address"
            dir="ltr"
            placeholder={t("fields.nationalAddressPlaceholder")}
            className={`${fieldClass} text-start`}
          />
        </Field>
        <Field
          label={t("fields.deedNumber")}
          htmlFor="deed_number"
          hint={tc("optional")}
        >
          <input
            id="deed_number"
            name="deed_number"
            dir="ltr"
            placeholder={t("fields.deedNumberPlaceholder")}
            className={`${fieldClass} text-start`}
          />
        </Field>
      </div>

      {state.error ? (
        <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {state.error === "name" ? t("errorName") : t("errorGeneric")}
        </p>
      ) : null}

      <div className="flex items-center gap-3 pt-1">
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
