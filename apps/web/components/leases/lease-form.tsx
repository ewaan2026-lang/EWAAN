"use client";

import { useActionState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Constants, type Enums } from "@ewaan/db";
import {
  createLeaseAction,
  updateLeaseAction,
  type LeaseState,
} from "@/lib/actions/leases";
import { Field, fieldClass } from "@/components/ui/field";

const initialState: LeaseState = {};
const frequencies = Constants.public.Enums.payment_frequency;
const lateFeeTypes = Constants.public.Enums.late_fee_type;
const leaseStatuses = Constants.public.Enums.lease_status;

export type UnitOption = { id: string; label: string };
export type TenantOption = { id: string; full_name: string };

export type LeaseInitial = {
  id: string;
  unit_id: string;
  tenant_id: string;
  contract_number: string;
  start_date: string;
  end_date: string;
  rent_amount: number;
  payment_frequency: Enums<"payment_frequency">;
  deposit_amount: number | null;
  late_fee_type: Enums<"late_fee_type">;
  late_fee_value: number | null;
  grace_period_days: number;
  auto_renew: boolean;
  status: Enums<"lease_status">;
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-4 mt-2 flex items-center gap-2 text-sm font-bold text-brand-teal-900/70">
      <span className="h-4 w-1 rounded-full bg-brand-teal" />
      {children}
    </h3>
  );
}

export function LeaseForm({
  units,
  tenants,
  initial,
}: {
  units: UnitOption[];
  tenants: TenantOption[];
  initial?: LeaseInitial;
}) {
  const t = useTranslations("leases");
  const tf = useTranslations("paymentFrequency");
  const tl = useTranslations("lateFeeType");
  const ts = useTranslations("leaseStatus");
  const tc = useTranslations("common");
  const locale = useLocale();
  const action = initial
    ? updateLeaseAction.bind(null, locale, initial.id)
    : createLeaseAction.bind(null, locale);
  const [state, formAction, pending] = useActionState(action, initialState);

  const errorMsg = state.error ? t(`errors.${state.error}`) : null;
  const statusOptions = initial
    ? leaseStatuses
    : (["draft", "active"] as Enums<"lease_status">[]);

  return (
    <form action={formAction} className="space-y-6">
      <section>
        <SectionTitle>{t("sections.parties")}</SectionTitle>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label={t("fields.unit")} htmlFor="unit_id">
            <select id="unit_id" name="unit_id" required defaultValue={initial?.unit_id ?? ""} className={fieldClass}>
              <option value="" disabled>
                —
              </option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("fields.tenant")} htmlFor="tenant_id">
            <select id="tenant_id" name="tenant_id" required defaultValue={initial?.tenant_id ?? ""} className={fieldClass}>
              <option value="" disabled>
                —
              </option>
              {tenants.map((tn) => (
                <option key={tn.id} value={tn.id}>
                  {tn.full_name}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      <section>
        <SectionTitle>{t("sections.terms")}</SectionTitle>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label={t("fields.startDate")} htmlFor="start_date">
            <input id="start_date" name="start_date" type="date" required defaultValue={initial?.start_date} className={fieldClass} />
          </Field>
          <Field label={t("fields.endDate")} htmlFor="end_date">
            <input id="end_date" name="end_date" type="date" required defaultValue={initial?.end_date} className={fieldClass} />
          </Field>
          <Field label={t("fields.rent")} htmlFor="rent_amount">
            <input id="rent_amount" name="rent_amount" type="number" inputMode="decimal" step="0.01" min="0" required dir="ltr" defaultValue={initial?.rent_amount} className={`${fieldClass} text-start`} />
          </Field>
          <Field label={t("fields.frequency")} htmlFor="payment_frequency">
            <select id="payment_frequency" name="payment_frequency" defaultValue={initial?.payment_frequency ?? "monthly"} className={fieldClass}>
              {frequencies.map((f) => (
                <option key={f} value={f}>
                  {tf(f)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("fields.deposit")} htmlFor="deposit_amount" hint={tc("optional")}>
            <input id="deposit_amount" name="deposit_amount" type="number" inputMode="decimal" step="0.01" min="0" dir="ltr" defaultValue={initial?.deposit_amount ?? undefined} className={`${fieldClass} text-start`} />
          </Field>
          <Field label={t("fields.contractNumber")} htmlFor="contract_number" hint={tc("optional")}>
            <input id="contract_number" name="contract_number" dir="ltr" defaultValue={initial?.contract_number} className={`${fieldClass} text-start`} />
          </Field>
        </div>
      </section>

      <section>
        <SectionTitle>{t("sections.late")}</SectionTitle>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Field label={t("fields.lateFeeType")} htmlFor="late_fee_type">
            <select id="late_fee_type" name="late_fee_type" defaultValue={initial?.late_fee_type ?? "none"} className={fieldClass}>
              {lateFeeTypes.map((lt) => (
                <option key={lt} value={lt}>
                  {tl(lt)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("fields.lateFeeValue")} htmlFor="late_fee_value" hint={tc("optional")}>
            <input id="late_fee_value" name="late_fee_value" type="number" inputMode="decimal" step="0.01" min="0" dir="ltr" defaultValue={initial?.late_fee_value ?? undefined} className={`${fieldClass} text-start`} />
          </Field>
          <Field label={t("fields.grace")} htmlFor="grace_period_days" hint={tc("optional")}>
            <input id="grace_period_days" name="grace_period_days" type="number" inputMode="numeric" min="0" dir="ltr" defaultValue={initial?.grace_period_days ?? undefined} className={`${fieldClass} text-start`} />
          </Field>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-3">
          <Field label={t("fields.status")} htmlFor="status">
            <select id="status" name="status" defaultValue={initial?.status ?? "draft"} className={fieldClass}>
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {ts(s)}
                </option>
              ))}
            </select>
          </Field>
          <label className="flex items-center gap-2.5 self-end pb-2.5 text-sm font-medium text-brand-teal-900">
            <input type="checkbox" name="auto_renew" defaultChecked={initial?.auto_renew} className="h-4 w-4 rounded border-brand-teal/30 text-brand-teal focus:ring-brand-teal/30" />
            {t("fields.autoRenew")}
          </label>
        </div>
      </section>

      {errorMsg ? (
        <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {errorMsg}
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
