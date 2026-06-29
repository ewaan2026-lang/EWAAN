"use client";

import { useActionState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { updateOrgAction, type OrgState } from "@/lib/actions/settings";
import { Field, fieldClass } from "@/components/ui/field";

const initialState: OrgState = {};

export type OrgData = {
  id: string;
  name: string;
  legal_name: string | null;
  cr_number: string | null;
  vat_number: string | null;
  email: string | null;
  phone: string | null;
  default_locale: string;
};

export function OrgForm({ org }: { org: OrgData }) {
  const t = useTranslations("settings");
  const tc = useTranslations("common");
  const locale = useLocale();
  const action = updateOrgAction.bind(null, locale, org.id);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <Field label={t("fields.name")} htmlFor="name">
        <input id="name" name="name" required defaultValue={org.name} className={fieldClass} />
      </Field>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label={t("fields.legalName")} htmlFor="legal_name" hint={tc("optional")}>
          <input id="legal_name" name="legal_name" defaultValue={org.legal_name ?? ""} className={fieldClass} />
        </Field>
        <Field label={t("fields.locale")} htmlFor="default_locale">
          <select id="default_locale" name="default_locale" defaultValue={org.default_locale} className={fieldClass}>
            <option value="ar">{t("localeAr")}</option>
            <option value="en">{t("localeEn")}</option>
          </select>
        </Field>
        <Field label={t("fields.crNumber")} htmlFor="cr_number" hint={tc("optional")}>
          <input id="cr_number" name="cr_number" dir="ltr" defaultValue={org.cr_number ?? ""} className={`${fieldClass} text-start`} />
        </Field>
        <Field label={t("fields.vatNumber")} htmlFor="vat_number" hint={tc("optional")}>
          <input id="vat_number" name="vat_number" dir="ltr" defaultValue={org.vat_number ?? ""} className={`${fieldClass} text-start`} />
        </Field>
        <Field label={t("fields.email")} htmlFor="email" hint={tc("optional")}>
          <input id="email" name="email" type="email" dir="ltr" defaultValue={org.email ?? ""} className={`${fieldClass} text-start`} />
        </Field>
        <Field label={t("fields.phone")} htmlFor="phone" hint={tc("optional")}>
          <input id="phone" name="phone" type="tel" dir="ltr" defaultValue={org.phone ?? ""} className={`${fieldClass} text-start`} />
        </Field>
      </div>

      {state.error ? (
        <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {state.error === "name" ? t("errorName") : t("errorGeneric")}
        </p>
      ) : null}
      {state.ok ? (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {t("saved")}
        </p>
      ) : null}

      <div className="pt-1">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-brand-teal px-6 py-2.5 text-[15px] font-bold text-white shadow-card transition hover:bg-brand-teal-700 disabled:opacity-60"
        >
          {pending ? tc("saving") : t("save")}
        </button>
      </div>
    </form>
  );
}
