"use client";

import { useActionState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Constants } from "@ewaan/db";
import { createRequestAction, type RequestState } from "@/lib/actions/maintenance";
import { Field, fieldClass } from "@/components/ui/field";

const initialState: RequestState = {};
const priorities = Constants.public.Enums.maintenance_priority;

export type UnitOption = { id: string; label: string };

export function RequestForm({ units }: { units: UnitOption[] }) {
  const t = useTranslations("maintenance");
  const tp = useTranslations("maintenancePriority");
  const tc = useTranslations("common");
  const locale = useLocale();
  const action = createRequestAction.bind(null, locale);
  const [state, formAction, pending] = useActionState(action, initialState);

  const errorMsg =
    state.error === "unit"
      ? t("errorUnit")
      : state.error === "title"
        ? t("errorTitle")
        : state.error === "generic"
          ? t("errorGeneric")
          : null;

  return (
    <form action={formAction} className="space-y-5">
      <Field label={t("fields.unit")} htmlFor="unit_id">
        <select id="unit_id" name="unit_id" required defaultValue="" className={fieldClass}>
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

      <Field label={t("fields.title")} htmlFor="title">
        <input
          id="title"
          name="title"
          required
          autoFocus
          placeholder={t("fields.titlePlaceholder")}
          className={fieldClass}
        />
      </Field>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label={t("fields.category")} htmlFor="category" hint={tc("optional")}>
          <input
            id="category"
            name="category"
            placeholder={t("fields.categoryPlaceholder")}
            className={fieldClass}
          />
        </Field>
        <Field label={t("fields.priority")} htmlFor="priority">
          <select id="priority" name="priority" defaultValue="medium" className={fieldClass}>
            {priorities.map((p) => (
              <option key={p} value={p}>
                {tp(p)}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label={t("fields.description")} htmlFor="description" hint={tc("optional")}>
        <textarea id="description" name="description" rows={4} className={`${fieldClass} resize-none`} />
      </Field>

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
          {pending ? tc("saving") : t("create")}
        </button>
      </div>
    </form>
  );
}
