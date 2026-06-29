import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/empty-state";
import { DeleteButton } from "@/components/ui/delete-button";
import { MediaGallery } from "@/components/media/media-gallery";
import {
  PriorityBadge,
  MaintenanceStatusBadge,
} from "@/components/maintenance/badges";
import { deleteTenantAction } from "@/lib/actions/tenants";
import {
  ArrowIcon,
  PhoneIcon,
  MailIcon,
  IdIcon,
  LayersIcon,
  PencilIcon,
} from "@/components/ui/icons";

export const dynamic = "force-dynamic";

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("");
}

export default async function TenantDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("tenants");
  const tc = await getTranslations("common");

  const supabase = await createClient();

  const tmedia = await getTranslations("media");
  const tm = await getTranslations("maintenance");

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, full_name, phone, email, national_id, organization_id")
    .eq("id", id)
    .maybeSingle();

  if (!tenant) notFound();

  const [{ data: leases }, { data: requests }] = await Promise.all([
    supabase
      .from("leases")
      .select("id, contract_number, status, start_date, end_date, rent_amount")
      .eq("tenant_id", id)
      .order("start_date", { ascending: false }),
    supabase
      .from("maintenance_requests")
      .select("id, title, status, priority")
      .eq("tenant_id", id)
      .order("created_at", { ascending: false }),
  ]);

  const leaseList = leases ?? [];
  const requestList = requests ?? [];

  const contacts: { icon: React.ReactNode; value: string }[] = [];
  if (tenant.phone) contacts.push({ icon: <PhoneIcon className="h-4 w-4" />, value: tenant.phone });
  if (tenant.email) contacts.push({ icon: <MailIcon className="h-4 w-4" />, value: tenant.email });
  if (tenant.national_id) contacts.push({ icon: <IdIcon className="h-4 w-4" />, value: tenant.national_id });

  const fmtRent = (n: number) =>
    new Intl.NumberFormat(locale === "ar" ? "ar-SA-u-nu-latn" : "en-US", {
      style: "currency",
      currency: "SAR",
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/tenants"
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-teal-900/60 transition hover:text-brand-teal-900"
      >
        <ArrowIcon className="h-4 w-4 rtl:rotate-180" />
        {t("title")}
      </Link>

      <div className="mb-7 flex flex-wrap items-center gap-4">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-brass to-brand-teal text-xl font-extrabold text-white">
          {initials(tenant.full_name)}
        </span>
        <h1 className="text-2xl font-extrabold tracking-tight text-brand-teal-900 sm:text-[28px]">
          {tenant.full_name}
        </h1>

        <div className="flex items-center gap-2 sm:ms-auto">
          <Link
            href={`/tenants/${id}/edit`}
            className="inline-flex items-center gap-2 rounded-xl border border-brand-teal/15 bg-white px-4 py-2.5 text-sm font-bold text-brand-teal-900 shadow-card transition hover:border-brand-teal/35 hover:bg-brand-teal/5"
          >
            <PencilIcon className="h-4 w-4 text-brand-teal" />
            {tc("edit")}
          </Link>
          <DeleteButton action={deleteTenantAction} id={id} locale={locale} />
        </div>
      </div>

      {contacts.length > 0 ? (
        <div className="mb-8 rounded-2xl border border-brand-teal/10 bg-white p-5 shadow-card">
          <h2 className="mb-3 text-sm font-bold text-brand-teal-900/70">
            {t("contactTitle")}
          </h2>
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            {contacts.map((c, i) => (
              <span key={i} className="flex items-center gap-2 text-sm text-brand-teal-900" dir="ltr">
                <span className="text-brand-teal">{c.icon}</span>
                {c.value}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <h2 className="mb-4 text-lg font-bold text-brand-teal-900">
        {t("leasesTitle")}
        {leaseList.length > 0 ? (
          <span className="ms-2 text-sm font-semibold text-brand-teal-900/40">
            {leaseList.length}
          </span>
        ) : null}
      </h2>

      {leaseList.length === 0 ? (
        <EmptyState
          icon={<LayersIcon className="h-7 w-7" />}
          title={t("leasesTitle")}
          body={t("noLeases")}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-brand-teal/10 bg-white shadow-card">
          {leaseList.map((l, i) => (
            <div
              key={l.id}
              className={`flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 ${
                i > 0 ? "border-t border-brand-teal/8" : ""
              }`}
            >
              <div>
                <p className="text-sm font-bold text-brand-teal-900">
                  {l.contract_number ?? `#${l.id.slice(0, 8)}`}
                </p>
                <p className="text-xs text-brand-teal-900/50" dir="ltr">
                  {l.start_date} → {l.end_date}
                </p>
              </div>
              <p className="text-sm font-bold text-brand-teal-900" dir="ltr">
                {fmtRent(l.rent_amount)}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* طلبات المستأجر */}
      {requestList.length > 0 ? (
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-bold text-brand-teal-900">{tm("title")}</h2>
          <div className="space-y-3">
            {requestList.map((r) => (
              <Link
                key={r.id}
                href={`/maintenance/${r.id}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-teal/10 bg-white p-4 shadow-card transition hover:border-brand-teal/25"
              >
                <p className="text-sm font-bold text-brand-teal-900">{r.title}</p>
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={r.priority} />
                  <MaintenanceStatusBadge status={r.status} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      {/* صور الاستلام */}
      <div className="mt-8">
        <MediaGallery
          organizationId={tenant.organization_id}
          entityType="tenant"
          entityId={tenant.id}
          kind="image"
          title={tmedia("handover")}
          redirectPath={`/tenants/${id}`}
          locale={locale}
        />
      </div>
    </div>
  );
}
