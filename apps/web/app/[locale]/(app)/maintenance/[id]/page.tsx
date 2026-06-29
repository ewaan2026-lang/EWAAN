import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Constants } from "@ewaan/db";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  PriorityBadge,
  MaintenanceStatusBadge,
} from "@/components/maintenance/badges";
import { updateRequestStatusAction } from "@/lib/actions/maintenance";
import { fieldClass } from "@/components/ui/field";
import { ArrowIcon } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

const statuses = Constants.public.Enums.maintenance_status;

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("maintenance");
  const tms = await getTranslations("maintenanceStatus");

  const supabase = await createClient();
  const { data: request } = await supabase
    .from("maintenance_requests")
    .select("id, title, description, category, priority, status, unit_id, reported_at")
    .eq("id", id)
    .maybeSingle();

  if (!request) notFound();

  const { data: unit } = await supabase
    .from("units")
    .select("id, unit_number, property_id")
    .eq("id", request.unit_id)
    .maybeSingle();

  let property: { id: string; name: string } | null = null;
  if (unit?.property_id) {
    const { data } = await supabase
      .from("properties")
      .select("id, name")
      .eq("id", unit.property_id)
      .maybeSingle();
    property = data;
  }

  const unitLabel = property?.name
    ? `${property.name} — ${unit?.unit_number ?? ""}`
    : unit?.unit_number ?? "—";

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/maintenance"
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-teal-900/60 transition hover:text-brand-teal-900"
      >
        <ArrowIcon className="h-4 w-4 rtl:rotate-180" />
        {t("title")}
      </Link>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight text-brand-teal-900 sm:text-[28px]">
          {request.title}
        </h1>
        <PriorityBadge priority={request.priority} />
        <MaintenanceStatusBadge status={request.status} />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-brand-teal/10 bg-brand-teal/10 shadow-card sm:grid-cols-3">
        <InfoCell
          label={t("fields.unit")}
          value={
            unit?.property_id ? (
              <Link href={`/properties/${unit.property_id}`} className="text-brand-teal hover:underline">
                {unitLabel}
              </Link>
            ) : (
              unitLabel
            )
          }
        />
        <InfoCell label={t("fields.category")} value={request.category ?? "—"} />
        <InfoCell
          label={t("reportedAt")}
          value={<span dir="ltr">{request.reported_at.slice(0, 10)}</span>}
        />
      </div>

      <div className="mb-8 rounded-2xl border border-brand-teal/10 bg-white p-5 shadow-card">
        <h2 className="mb-2 text-sm font-bold text-brand-teal-900/70">
          {t("fields.description")}
        </h2>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-brand-teal-900/70">
          {request.description ?? t("noDescription")}
        </p>
      </div>

      {/* تحديث الحالة */}
      <div className="rounded-2xl border border-brand-teal/10 bg-white p-5 shadow-card">
        <h2 className="mb-3 text-sm font-bold text-brand-teal-900/70">
          {t("updateStatus")}
        </h2>
        <form action={updateRequestStatusAction} className="flex flex-wrap items-center gap-3">
          <input type="hidden" name="request_id" value={request.id} />
          <input type="hidden" name="locale" value={locale} />
          <select
            name="status"
            defaultValue={request.status}
            className={`${fieldClass} max-w-[200px]`}
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {tms(s)}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-xl bg-brand-teal px-5 py-2.5 text-sm font-bold text-white shadow-card transition hover:bg-brand-teal-700"
          >
            {t("updateStatus")}
          </button>
        </form>
      </div>
    </div>
  );
}

function InfoCell({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-white px-4 py-3.5">
      <p className="text-xs font-medium text-brand-teal-900/45">{label}</p>
      <p className="mt-1 text-sm font-bold text-brand-teal-900">{value}</p>
    </div>
  );
}
