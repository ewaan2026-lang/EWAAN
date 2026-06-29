import { getTranslations } from "next-intl/server";
import {
  createUnitTypeAction,
  deleteUnitTypeAction,
} from "@/lib/actions/unit-types";
import { fieldClass } from "@/components/ui/field";
import { LayersIcon, PlusIcon, TrashIcon } from "@/components/ui/icons";

export type UnitTypeRow = { id: string; name: string; description: string | null };

export async function UnitTypesSection({
  types,
  locale,
}: {
  types: UnitTypeRow[];
  locale: string;
}) {
  const t = await getTranslations("settings");

  return (
    <div className="mt-8 overflow-hidden rounded-3xl border border-brand-teal/10 bg-white shadow-card">
      <div className="flex items-center gap-3 border-b border-brand-teal/8 bg-gradient-to-l from-brand-teal/5 to-transparent px-7 py-5">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-teal/10 text-brand-teal">
          <LayersIcon className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-lg font-bold text-brand-teal-900">{t("unitTypesTitle")}</h2>
          <p className="text-xs text-brand-teal-900/55">{t("unitTypesSubtitle")}</p>
        </div>
      </div>

      <div className="px-7 py-6">
        {types.length === 0 ? (
          <p className="mb-4 text-sm text-brand-teal-900/55">{t("noTypes")}</p>
        ) : (
          <div className="mb-5 flex flex-wrap gap-2">
            {types.map((ty) => (
              <span
                key={ty.id}
                className="inline-flex items-center gap-2 rounded-full bg-brand-teal/8 py-1.5 pe-1.5 ps-3.5 text-sm font-semibold text-brand-teal-900"
              >
                {ty.name}
                <form action={deleteUnitTypeAction}>
                  <input type="hidden" name="id" value={ty.id} />
                  <input type="hidden" name="locale" value={locale} />
                  <button
                    type="submit"
                    aria-label="delete"
                    className="flex h-6 w-6 items-center justify-center rounded-full text-brand-teal-900/40 transition hover:bg-rose-100 hover:text-rose-600"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                  </button>
                </form>
              </span>
            ))}
          </div>
        )}

        <form action={createUnitTypeAction} className="flex flex-wrap items-end gap-2">
          <input type="hidden" name="locale" value={locale} />
          <input
            name="name"
            required
            placeholder={t("unitTypeNamePlaceholder")}
            className={`${fieldClass} max-w-[220px] py-2.5`}
          />
          <input
            name="description"
            placeholder={t("unitTypeDesc")}
            className={`${fieldClass} max-w-[220px] py-2.5`}
          />
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-teal px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-teal-700"
          >
            <PlusIcon className="h-4 w-4" />
            {t("addType")}
          </button>
        </form>
      </div>
    </div>
  );
}
