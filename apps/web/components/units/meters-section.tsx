import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import {
  createMeterAction,
  deleteMeterAction,
  addReadingAction,
} from "@/lib/actions/meters";
import { fieldClass } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { PlusIcon, TrashIcon } from "@/components/ui/icons";

export async function MetersSection({
  unitId,
  locale,
  redirectPath,
}: {
  unitId: string;
  locale: string;
  redirectPath: string;
}) {
  const t = await getTranslations("meters");
  const supabase = await createClient();

  const { data: meters } = await supabase
    .from("meters")
    .select("id, type, meter_number")
    .eq("unit_id", unitId)
    .order("created_at", { ascending: true });

  const meterIds = (meters ?? []).map((m) => m.id);
  const { data: readings } = meterIds.length
    ? await supabase
        .from("meter_readings")
        .select("meter_id, reading, reading_date")
        .in("meter_id", meterIds)
        .order("reading_date", { ascending: false })
    : { data: [] };

  const latest = new Map<string, { reading: number; reading_date: string }>();
  for (const r of readings ?? []) {
    if (!latest.has(r.meter_id))
      latest.set(r.meter_id, { reading: r.reading, reading_date: r.reading_date });
  }

  const fmtNum = (n: number) =>
    new Intl.NumberFormat("ar-SA-u-nu-latn", { maximumFractionDigits: 2 }).format(n);

  return (
    <div className="rounded-2xl border border-brand-teal/10 bg-white p-5 shadow-card">
      <h2 className="mb-4 text-base font-bold text-brand-teal-900">{t("title")}</h2>

      {/* قائمة العدّادات */}
      <div className="space-y-3">
        {(meters ?? []).map((m) => {
          const last = latest.get(m.id);
          return (
            <div key={m.id} className="rounded-xl border border-brand-teal/10 bg-brand-cream/20 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge tone={m.type === "water" ? "teal" : "amber"}>
                    {t(m.type)}
                  </Badge>
                  {m.meter_number ? (
                    <span className="text-sm font-semibold text-brand-teal-900" dir="ltr">
                      {m.meter_number}
                    </span>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-brand-teal-900/55">
                    {t("latestReading")}:{" "}
                    <span className="font-bold text-brand-teal-900" dir="ltr">
                      {last ? `${fmtNum(last.reading)} · ${last.reading_date}` : t("noReadings")}
                    </span>
                  </span>
                  <form action={deleteMeterAction}>
                    <input type="hidden" name="id" value={m.id} />
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="redirect_path" value={redirectPath} />
                    <button type="submit" aria-label="delete" className="flex h-7 w-7 items-center justify-center rounded-lg text-brand-teal-900/40 transition hover:bg-rose-50 hover:text-rose-600">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </div>

              {/* إضافة قراءة */}
              <form action={addReadingAction} className="mt-3 flex flex-wrap items-end gap-2">
                <input type="hidden" name="meter_id" value={m.id} />
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="redirect_path" value={redirectPath} />
                <input
                  name="reading"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  required
                  placeholder={t("reading")}
                  dir="ltr"
                  className={`${fieldClass} max-w-[130px] py-2 text-start`}
                />
                <input name="reading_date" type="date" className={`${fieldClass} max-w-[160px] py-2`} />
                <button type="submit" className="rounded-lg bg-brand-teal/10 px-3 py-2 text-xs font-bold text-brand-teal-900 transition hover:bg-brand-teal hover:text-white">
                  {t("addReading")}
                </button>
              </form>
            </div>
          );
        })}
      </div>

      {/* إضافة عدّاد */}
      <form action={createMeterAction} className="mt-4 flex flex-wrap items-end gap-2 border-t border-brand-teal/8 pt-4">
        <input type="hidden" name="unit_id" value={unitId} />
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="redirect_path" value={redirectPath} />
        <select name="type" defaultValue="electricity" className={`${fieldClass} max-w-[130px] py-2`}>
          <option value="electricity">{t("electricity")}</option>
          <option value="water">{t("water")}</option>
        </select>
        <input name="meter_number" placeholder={t("number")} dir="ltr" className={`${fieldClass} max-w-[160px] py-2 text-start`} />
        <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-brand-teal px-4 py-2 text-xs font-bold text-white transition hover:bg-brand-teal-700">
          <PlusIcon className="h-4 w-4" />
          {t("add")}
        </button>
      </form>
    </div>
  );
}
