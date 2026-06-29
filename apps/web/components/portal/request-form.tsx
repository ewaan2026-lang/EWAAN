"use client";

import { useActionState, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Constants } from "@ewaan/db";
import {
  createTenantRequestAction,
  type PortalRequestState,
} from "@/lib/actions/portal";
import { Field, fieldClass } from "@/components/ui/field";

const initialState: PortalRequestState = {};
const priorities = Constants.public.Enums.maintenance_priority;

export function TenantRequestForm({
  organizationId,
  unitId,
  tenantId,
  leaseId,
}: {
  organizationId: string;
  unitId: string;
  tenantId: string;
  leaseId: string;
}) {
  const t = useTranslations("portal");
  const tp = useTranslations("maintenancePriority");
  const locale = useLocale();
  const formRef = useRef<HTMLFormElement>(null);
  const action = createTenantRequestAction.bind(null, locale);
  const [state, formAction, pending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <input type="hidden" name="organization_id" value={organizationId} />
      <input type="hidden" name="unit_id" value={unitId} />
      <input type="hidden" name="tenant_id" value={tenantId} />
      <input type="hidden" name="lease_id" value={leaseId} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <Field label={t("fields.title")} htmlFor="title">
            <input id="title" name="title" required placeholder={t("fields.titlePlaceholder")} className={fieldClass} />
          </Field>
        </div>
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

      <Field label={t("fields.description")} htmlFor="description">
        <textarea id="description" name="description" rows={3} className={`${fieldClass} resize-none`} />
      </Field>

      {state.error ? (
        <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {state.error === "title" ? t("errorTitle") : t("errorGeneric")}
        </p>
      ) : null}
      {state.ok ? (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {t("submitted")}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-brand-teal px-6 py-2.5 text-[15px] font-bold text-white shadow-card transition hover:bg-brand-teal-700 disabled:opacity-60"
      >
        {t("submit")}
      </button>
    </form>
  );
}
