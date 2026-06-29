"use client";

import { useActionState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Constants, type Enums } from "@ewaan/db";
import {
  createPropertyAction,
  updatePropertyAction,
  type PropertyState,
} from "@/lib/actions/properties";
import { Field, fieldClass } from "@/components/ui/field";
import { LocationPicker } from "@/components/map/location-picker";

const initialState: PropertyState = {};
const propertyTypes = Constants.public.Enums.property_type;

export type OwnerOption = { id: string; full_name: string };

export type PropertyInitial = {
  id: string;
  name: string;
  property_type: Enums<"property_type">;
  city: string;
  district: string;
  national_address: string;
  deed_number: string;
  owner_id: string;
  services: string[];
  whatsapp_group_url: string;
  latitude: number | null;
  longitude: number | null;
};

export function PropertyForm({
  owners = [],
  initial,
}: {
  owners?: OwnerOption[];
  initial?: PropertyInitial;
}) {
  const t = useTranslations("properties");
  const tp = useTranslations("propertyTypes");
  const tc = useTranslations("common");
  const tm = useTranslations("map");
  const locale = useLocale();

  const action = initial
    ? updatePropertyAction.bind(null, locale, initial.id)
    : createPropertyAction.bind(null, locale);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <Field label={t("fields.name")} htmlFor="name">
        <input
          id="name"
          name="name"
          required
          autoFocus
          defaultValue={initial?.name}
          placeholder={t("fields.namePlaceholder")}
          className={fieldClass}
        />
      </Field>

      <Field label={t("fields.type")} htmlFor="property_type">
        <select
          id="property_type"
          name="property_type"
          defaultValue={initial?.property_type ?? "residential_building"}
          className={fieldClass}
        >
          {propertyTypes.map((tp_) => (
            <option key={tp_} value={tp_}>
              {tp(tp_)}
            </option>
          ))}
        </select>
      </Field>

      {owners.length > 0 ? (
        <Field label={t("fields.owner")} htmlFor="owner_id" hint={tc("optional")}>
          <select
            id="owner_id"
            name="owner_id"
            defaultValue={initial?.owner_id ?? ""}
            className={fieldClass}
          >
            <option value="">{t("fields.ownerNone")}</option>
            {owners.map((o) => (
              <option key={o.id} value={o.id}>
                {o.full_name}
              </option>
            ))}
          </select>
        </Field>
      ) : null}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label={t("fields.city")} htmlFor="city" hint={tc("optional")}>
          <input
            id="city"
            name="city"
            defaultValue={initial?.city}
            placeholder={t("fields.cityPlaceholder")}
            className={fieldClass}
          />
        </Field>
        <Field label={t("fields.district")} htmlFor="district" hint={tc("optional")}>
          <input
            id="district"
            name="district"
            defaultValue={initial?.district}
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
            defaultValue={initial?.national_address}
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
            defaultValue={initial?.deed_number}
            placeholder={t("fields.deedNumberPlaceholder")}
            className={`${fieldClass} text-start`}
          />
        </Field>
      </div>

      <Field label={t("services")} htmlFor="services" hint={t("servicesHint")}>
        <input
          id="services"
          name="services"
          defaultValue={initial?.services?.join("، ")}
          placeholder={t("servicesPlaceholder")}
          className={fieldClass}
        />
      </Field>

      <Field label={t("whatsappGroup")} htmlFor="whatsapp_group_url" hint={tc("optional")}>
        <input
          id="whatsapp_group_url"
          name="whatsapp_group_url"
          type="url"
          dir="ltr"
          defaultValue={initial?.whatsapp_group_url}
          placeholder={t("whatsappGroupPlaceholder")}
          className={`${fieldClass} text-start`}
        />
      </Field>

      <div>
        <div className="mb-2 flex items-center gap-2">
          <span className="h-4 w-1 rounded-full bg-gradient-to-b from-brand-gold to-brand-brass" />
          <p className="text-sm font-bold text-brand-teal-900">{tm("locationTitle")}</p>
          <span className="text-xs font-medium text-brand-teal-900/45">{tc("optional")}</span>
        </div>
        <LocationPicker
          initialLat={initial?.latitude ?? null}
          initialLng={initial?.longitude ?? null}
        />
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
          {pending ? tc("saving") : initial ? t("saveChanges") : t("create")}
        </button>
      </div>
    </form>
  );
}
