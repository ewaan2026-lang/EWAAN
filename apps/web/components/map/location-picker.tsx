"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { LeafletMap } from "./leaflet-map";
import { fieldClass } from "@/components/ui/field";

function round6(n: number) {
  return Math.round(n * 1e6) / 1e6;
}

// منتقي موقع العقار — طريقتان متزامنتان:
// 1) النقر/سحب الدبوس على الخريطة.  2) كتابة الإحداثيات يدوياً.
export function LocationPicker({
  initialLat = null,
  initialLng = null,
}: {
  initialLat?: number | null;
  initialLng?: number | null;
}) {
  const t = useTranslations("map");
  const [latStr, setLatStr] = useState(initialLat != null ? String(initialLat) : "");
  const [lngStr, setLngStr] = useState(initialLng != null ? String(initialLng) : "");

  const latNum = latStr.trim() === "" ? null : Number(latStr);
  const lngNum = lngStr.trim() === "" ? null : Number(lngStr);
  const mapLat = latNum != null && Number.isFinite(latNum) ? latNum : null;
  const mapLng = lngNum != null && Number.isFinite(lngNum) ? lngNum : null;

  const pick = (la: number, ln: number) => {
    setLatStr(String(round6(la)));
    setLngStr(String(round6(ln)));
  };

  const clear = () => {
    setLatStr("");
    setLngStr("");
  };

  return (
    <div className="space-y-3">
      <div className="relative h-64 overflow-hidden rounded-2xl border border-brand-teal/15 shadow-card ring-1 ring-brand-gold/15">
        <span className="pointer-events-none absolute inset-x-0 top-0 z-[1000] h-1 bg-gradient-to-r from-brand-gold via-brand-brass to-brand-gold opacity-90" />
        <LeafletMap lat={mapLat} lng={mapLng} interactive zoom={14} onPick={pick} />
      </div>
      <p className="text-xs text-brand-teal-900/55">{t("pickerHint")}</p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-brand-teal-900/70">
            {t("latitude")}
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
            {t("longitude")}
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

      {latStr !== "" || lngStr !== "" ? (
        <button
          type="button"
          onClick={clear}
          className="text-xs font-semibold text-rose-600 transition hover:text-rose-700"
        >
          {t("clear")}
        </button>
      ) : null}
    </div>
  );
}
