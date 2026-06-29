"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { AddressCombobox, type ComboOption } from "./address-combobox";
import { LeafletMap } from "@/components/map/leaflet-map";
import { Field, fieldClass } from "@/components/ui/field";

type City = { id: number; r: number; ar: string; en: string; c: [number, number] };
type Dist = { id: number; c: number; ar: string; en: string };

export type LocationInitial = {
  city?: string;
  district?: string;
  street?: string;
  building_number?: string;
  national_address?: string;
  latitude?: number | null;
  longitude?: number | null;
};

function round6(n: number) {
  return Math.round(n * 1e6) / 1e6;
}

export function PropertyLocationSection({ initial }: { initial?: LocationInitial }) {
  const t = useTranslations("properties");
  const tm = useTranslations("map");
  const tc = useTranslations("common");
  const locale = useLocale();
  const isAr = locale !== "en";

  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<Dist[]>([]);
  const [cityText, setCityText] = useState(initial?.city ?? "");
  const [cityId, setCityId] = useState<number | null>(null);
  const [districtText, setDistrictText] = useState(initial?.district ?? "");

  const [latStr, setLatStr] = useState(
    initial?.latitude != null ? String(initial.latitude) : "",
  );
  const [lngStr, setLngStr] = useState(
    initial?.longitude != null ? String(initial.longitude) : "",
  );

  // تحميل المدن مرّة واحدة.
  useEffect(() => {
    fetch("/data/ksa/cities.json")
      .then((r) => r.json())
      .then(setCities)
      .catch(() => {});
  }, []);

  // تحميل الأحياء عند أول اختيار لمدينة.
  useEffect(() => {
    if (cityId != null && districts.length === 0) {
      fetch("/data/ksa/districts.json")
        .then((r) => r.json())
        .then(setDistricts)
        .catch(() => {});
    }
  }, [cityId, districts.length]);

  // مطابقة المدينة المحفوظة (عند التعديل) لتفعيل قائمة الأحياء.
  useEffect(() => {
    if (cities.length && cityId == null && cityText) {
      const m = cities.find((c) => c.ar === cityText || c.en === cityText);
      if (m) setCityId(m.id);
    }
  }, [cities, cityText, cityId]);

  const label = (o: { ar: string; en: string }) => (isAr ? o.ar : o.en);

  const cityOptions: ComboOption[] = useMemo(
    () => cities.map((c) => ({ id: c.id, label: label(c) })),
    [cities, isAr],
  );
  const districtOptions: ComboOption[] = useMemo(
    () =>
      cityId != null
        ? districts.filter((d) => d.c === cityId).map((d) => ({ id: d.id, label: label(d) }))
        : [],
    [districts, cityId, isAr],
  );

  const onPickCity = (opt: ComboOption) => {
    setCityId(opt.id);
    setDistrictText("");
    const city = cities.find((c) => c.id === opt.id);
    // حرّك الدبوس لمركز المدينة إن لم يُحدَّد موقع بعد.
    if (city && latStr === "" && lngStr === "") {
      setLatStr(String(city.c[0]));
      setLngStr(String(city.c[1]));
    }
  };

  const latNum = latStr.trim() === "" ? null : Number(latStr);
  const lngNum = lngStr.trim() === "" ? null : Number(lngStr);
  const mapLat = latNum != null && Number.isFinite(latNum) ? latNum : null;
  const mapLng = lngNum != null && Number.isFinite(lngNum) ? lngNum : null;

  const pickPin = (la: number, ln: number) => {
    setLatStr(String(round6(la)));
    setLngStr(String(round6(ln)));
  };

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <span className="h-4 w-1 rounded-full bg-gradient-to-b from-brand-gold to-brand-brass" />
        <p className="text-sm font-bold text-brand-teal-900">{tm("locationTitle")}</p>
        <span className="text-xs font-medium text-brand-teal-900/45">{tc("optional")}</span>
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label={t("fields.city")} htmlFor="city">
            <AddressCombobox
              name="city"
              value={cityText}
              onChange={setCityText}
              options={cityOptions}
              onSelectOption={onPickCity}
              placeholder={t("fields.cityPlaceholder")}
            />
          </Field>
          <Field label={t("fields.district")} htmlFor="district">
            <AddressCombobox
              name="district"
              value={districtText}
              onChange={setDistrictText}
              options={districtOptions}
              placeholder={t("fields.districtPlaceholder")}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label={t("fields.street")} htmlFor="street">
            <input
              id="street"
              name="street"
              defaultValue={initial?.street}
              placeholder={t("fields.streetPlaceholder")}
              className={fieldClass}
            />
          </Field>
          <Field label={t("fields.buildingNumber")} htmlFor="building_number">
            <input
              id="building_number"
              name="building_number"
              dir="ltr"
              defaultValue={initial?.building_number}
              placeholder={t("fields.buildingNumberPlaceholder")}
              className={`${fieldClass} text-start`}
            />
          </Field>
        </div>

        <Field label={t("fields.nationalAddress")} htmlFor="national_address">
          <input
            id="national_address"
            name="national_address"
            dir="ltr"
            defaultValue={initial?.national_address}
            placeholder={t("fields.nationalAddressPlaceholder")}
            className={`${fieldClass} text-start`}
          />
        </Field>

        {/* الخريطة */}
        <div>
          <div className="relative h-64 overflow-hidden rounded-2xl border border-brand-teal/15 shadow-card ring-1 ring-brand-gold/15">
            <span className="pointer-events-none absolute inset-x-0 top-0 z-[1000] h-1 bg-gradient-to-r from-brand-gold via-brand-brass to-brand-gold opacity-90" />
            <LeafletMap lat={mapLat} lng={mapLng} interactive zoom={14} onPick={pickPin} />
          </div>
          <p className="mt-2 text-xs text-brand-teal-900/55">{tm("pickerHint")}</p>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-brand-teal-900/70">
                {tm("latitude")}
              </span>
              <input
                name="latitude"
                type="number"
                step="any"
                inputMode="decimal"
                dir="ltr"
                value={latStr}
                onChange={(e) => setLatStr(e.target.value)}
                placeholder="24.7136"
                className={`${fieldClass} text-start`}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-brand-teal-900/70">
                {tm("longitude")}
              </span>
              <input
                name="longitude"
                type="number"
                step="any"
                inputMode="decimal"
                dir="ltr"
                value={lngStr}
                onChange={(e) => setLngStr(e.target.value)}
                placeholder="46.6753"
                className={`${fieldClass} text-start`}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
