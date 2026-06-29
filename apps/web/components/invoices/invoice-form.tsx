"use client";

import { useActionState, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { createInvoiceAction, type InvoiceState } from "@/lib/actions/invoices";
import { Field, fieldClass } from "@/components/ui/field";
import { CreatableSelect } from "@/components/ui/creatable-select";
import { TenantForm } from "@/components/tenants/tenant-form";

const initialState: InvoiceState = {};
const TYPES = ["rent", "management_fee", "service", "deposit", "other"] as const;

export type TenantOpt = { id: string; full_name: string };
export type LeaseOpt = { id: string; label: string };

export function InvoiceForm({
  tenants,
  leases,
  today,
}: {
  tenants: TenantOpt[];
  leases: LeaseOpt[];
  today: string;
}) {
  const t = useTranslations("invoices");
  const tc = useTranslations("common");
  const tt = useTranslations("tenants");
  const locale = useLocale();
  const action = createInvoiceAction.bind(null, locale);
  const [state, formAction, pending] = useActionState(action, initialState);

  const [subtotal, setSubtotal] = useState("");
  const [vatRate, setVatRate] = useState("15");

  const sub = Number(subtotal) || 0;
  const rate = Number(vatRate) || 0;
  const tax = Math.round(sub * (rate / 100) * 100) / 100;
  const total = Math.round((sub + tax) * 100) / 100;
  const fmt = (n: number) =>
    new Intl.NumberFormat(locale === "ar" ? "ar-SA-u-nu-latn" : "en-US", {
      style: "currency",
      currency: "SAR",
      maximumFractionDigits: 2,
    }).format(n);

  return (
    <form action={formAction} className="space-y-5">
      <Field label={t("fields.tenant")} htmlFor="tenant_id">
        <CreatableSelect
          name="tenant_id"
          required
          options={tenants.map((x) => ({ id: x.id, label: x.full_name }))}
          addLabel={tt("add")}
          title={tt("add")}
          renderForm={(onCreated) => <TenantForm onCreated={onCreated} />}
        />
      </Field>

      {leases.length > 0 ? (
        <Field label={t("fields.lease")} htmlFor="lease_id" hint={tc("optional")}>
          <select id="lease_id" name="lease_id" defaultValue="" className={fieldClass}>
            <option value="">{t("fields.leaseNone")}</option>
            {leases.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
        </Field>
      ) : null}

      <Field label={t("fields.type")} htmlFor="type">
        <select id="type" name="type" defaultValue="rent" className={fieldClass}>
          {TYPES.map((ty) => (
            <option key={ty} value={ty}>
              {t(`types.${ty}`)}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label={t("fields.subtotal")} htmlFor="subtotal">
          <input
            id="subtotal"
            name="subtotal"
            type="number"
            step="0.01"
            min="0"
            dir="ltr"
            required
            value={subtotal}
            onChange={(e) => setSubtotal(e.target.value)}
            className={`${fieldClass} text-start`}
          />
        </Field>
        <Field label={t("fields.vatRate")} htmlFor="vat_rate" hint={t("vatHint")}>
          <input
            id="vat_rate"
            name="vat_rate"
            type="number"
            step="0.5"
            min="0"
            dir="ltr"
            value={vatRate}
            onChange={(e) => setVatRate(e.target.value)}
            className={`${fieldClass} text-start`}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label={t("fields.issueDate")} htmlFor="issue_date">
          <input
            id="issue_date"
            name="issue_date"
            type="date"
            dir="ltr"
            defaultValue={today}
            className={`${fieldClass} text-start`}
          />
        </Field>
        <Field label={t("fields.dueDate")} htmlFor="due_date" hint={tc("optional")}>
          <input
            id="due_date"
            name="due_date"
            type="date"
            dir="ltr"
            className={`${fieldClass} text-start`}
          />
        </Field>
      </div>

      <Field label={t("fields.notes")} htmlFor="notes" hint={tc("optional")}>
        <input id="notes" name="notes" className={fieldClass} />
      </Field>

      {/* معاينة الإجمالي */}
      <div className="rounded-2xl border border-brand-teal/10 bg-brand-teal/[0.04] p-4">
        <div className="flex items-center justify-between text-sm text-brand-teal-900/70">
          <span>{t("subtotalLabel")}</span>
          <span dir="ltr">{fmt(sub)}</span>
        </div>
        <div className="mt-1.5 flex items-center justify-between text-sm text-brand-teal-900/70">
          <span>{t("taxLabel")}</span>
          <span dir="ltr">{fmt(tax)}</span>
        </div>
        <div className="mt-2.5 flex items-center justify-between border-t border-brand-teal/10 pt-2.5 text-base font-extrabold text-brand-teal-900">
          <span>{t("totalPreview")}</span>
          <span dir="ltr">{fmt(total)}</span>
        </div>
      </div>

      {state.error ? (
        <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {state.error === "tenant"
            ? t("errorTenant")
            : state.error === "amount"
              ? t("errorAmount")
              : t("errorGeneric")}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-brand-teal px-6 py-2.5 text-[15px] font-bold text-white shadow-card transition hover:bg-brand-teal-700 disabled:opacity-60"
      >
        {pending ? tc("saving") : t("create")}
      </button>
    </form>
  );
}
