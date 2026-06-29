import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { DeleteButton } from "@/components/ui/delete-button";
import { deleteOwnerAction } from "@/lib/actions/owners";
import {
  ArrowIcon,
  BuildingIcon,
  PhoneIcon,
  MailIcon,
  IdIcon,
  PencilIcon,
  ChartIcon,
} from "@/components/ui/icons";
import {
  PropertyCard,
  type PropertyStats,
} from "@/components/properties/property-card";

export const dynamic = "force-dynamic";

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("");
}

export default async function OwnerDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("owners");
  const tc = await getTranslations("common");

  const supabase = await createClient();

  const { data: owner } = await supabase
    .from("owners")
    .select("id, full_name, phone, email, national_id, iban, commission_rate, notes")
    .eq("id", id)
    .maybeSingle();

  if (!owner) notFound();

  const { data: properties } = await supabase
    .from("properties")
    .select("id, name, property_type, address, national_address")
    .eq("owner_id", id)
    .order("created_at", { ascending: false });

  const propertyList = properties ?? [];
  const propertyIds = propertyList.map((p) => p.id);

  const statsByProperty = new Map<string, PropertyStats>();
  if (propertyIds.length > 0) {
    const { data: units } = await supabase
      .from("units")
      .select("property_id, status")
      .in("property_id", propertyIds);
    for (const u of units ?? []) {
      const s =
        statsByProperty.get(u.property_id) ??
        ({ total: 0, occupied: 0, vacant: 0 } as PropertyStats);
      s.total += 1;
      if (u.status === "occupied") s.occupied += 1;
      if (u.status === "vacant") s.vacant += 1;
      statsByProperty.set(u.property_id, s);
    }
  }

  const contacts: { icon: React.ReactNode; value: string }[] = [];
  if (owner.phone) contacts.push({ icon: <PhoneIcon className="h-4 w-4" />, value: owner.phone });
  if (owner.email) contacts.push({ icon: <MailIcon className="h-4 w-4" />, value: owner.email });
  if (owner.national_id) contacts.push({ icon: <IdIcon className="h-4 w-4" />, value: owner.national_id });

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href="/owners"
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-teal-900/60 transition hover:text-brand-teal-900"
      >
        <ArrowIcon className="h-4 w-4 rtl:rotate-180" />
        {t("title")}
      </Link>

      {/* ترويسة المالك */}
      <div className="mb-7 flex flex-wrap items-center gap-4">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-teal to-brand-teal-900 text-xl font-extrabold text-white shadow-luxe ring-2 ring-brand-gold/35">
          {initials(owner.full_name)}
        </span>
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold tracking-tight text-brand-teal-900 sm:text-[28px]">
            {owner.full_name}
          </h1>
          {owner.commission_rate != null ? (
            <div className="mt-1.5">
              <Badge tone="teal">
                {t("commissionLabel")} {owner.commission_rate}%
              </Badge>
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-2 sm:ms-auto">
          <Link
            href={`/owners/${id}/statement`}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-teal px-4 py-2.5 text-sm font-bold text-white shadow-card transition hover:bg-brand-teal-700"
          >
            <ChartIcon className="h-4 w-4" />
            {t("viewStatement")}
          </Link>
          <Link
            href={`/owners/${id}/edit`}
            className="inline-flex items-center gap-2 rounded-xl border border-brand-teal/15 bg-white px-4 py-2.5 text-sm font-bold text-brand-teal-900 shadow-card transition hover:border-brand-teal/35 hover:bg-brand-teal/5"
          >
            <PencilIcon className="h-4 w-4 text-brand-teal" />
            {tc("edit")}
          </Link>
          <DeleteButton action={deleteOwnerAction} id={id} locale={locale} />
        </div>
      </div>

      {/* بيانات التواصل + الآيبان */}
      {contacts.length > 0 || owner.iban ? (
        <div className="mb-8 rounded-2xl border border-brand-teal/10 bg-white p-5 shadow-card">
          <h2 className="mb-3 text-sm font-bold text-brand-teal-900/70">
            {t("contactTitle")}
          </h2>
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            {contacts.map((c, i) => (
              <span
                key={i}
                className="flex items-center gap-2 text-sm text-brand-teal-900"
                dir="ltr"
              >
                <span className="text-brand-teal">{c.icon}</span>
                {c.value}
              </span>
            ))}
            {owner.iban ? (
              <span className="flex items-center gap-2 text-sm text-brand-teal-900" dir="ltr">
                <span className="text-brand-teal font-bold">IBAN</span>
                {owner.iban}
              </span>
            ) : null}
          </div>
          {owner.notes ? (
            <p className="mt-4 border-t border-brand-teal/8 pt-3 text-sm leading-relaxed text-brand-teal-900/60">
              {owner.notes}
            </p>
          ) : null}
        </div>
      ) : null}

      {/* عقارات المالك */}
      <h2 className="mb-4 text-lg font-bold text-brand-teal-900">
        {t("propertiesTitle")}
        {propertyList.length > 0 ? (
          <span className="ms-2 text-sm font-semibold text-brand-teal-900/40">
            {propertyList.length}
          </span>
        ) : null}
      </h2>

      {propertyList.length === 0 ? (
        <EmptyState
          icon={<BuildingIcon className="h-7 w-7" />}
          title={t("propertiesTitle")}
          body={t("noProperties")}
        />
      ) : (
        <div className="stagger grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {propertyList.map((p) => (
            <PropertyCard
              key={p.id}
              property={p}
              stats={statsByProperty.get(p.id) ?? { total: 0, occupied: 0, vacant: 0 }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
