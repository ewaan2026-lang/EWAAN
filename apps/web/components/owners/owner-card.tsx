import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { PhoneIcon, MailIcon, BuildingIcon } from "@/components/ui/icons";

export type OwnerCardData = {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  commission_rate: number | null;
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]).join("");
}

export async function OwnerCard({
  owner,
  propertyCount,
}: {
  owner: OwnerCardData;
  propertyCount: number;
}) {
  const t = await getTranslations("owners");

  return (
    <Link
      href={`/owners/${owner.id}`}
      className="group flex flex-col rounded-2xl border border-brand-teal/10 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:border-brand-teal/25 hover:shadow-lg"
    >
      <div className="flex items-start gap-3.5">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-teal to-brand-teal-900 text-base font-extrabold text-white">
          {initials(owner.full_name)}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-bold text-brand-teal-900">
            {owner.full_name}
          </h3>
          <div className="mt-1.5 space-y-1">
            {owner.phone ? (
              <p className="flex items-center gap-1.5 text-xs text-brand-teal-900/55" dir="ltr">
                <PhoneIcon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{owner.phone}</span>
              </p>
            ) : null}
            {owner.email ? (
              <p className="flex items-center gap-1.5 text-xs text-brand-teal-900/55" dir="ltr">
                <MailIcon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{owner.email}</span>
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-brand-teal/8 pt-3.5">
        <span className="flex items-center gap-1.5 text-xs font-medium text-brand-teal-900/55">
          <BuildingIcon className="h-4 w-4" />
          {t("propertiesCount", { count: propertyCount })}
        </span>
        {owner.commission_rate != null ? (
          <Badge tone="teal">
            {t("commissionLabel")} {owner.commission_rate}%
          </Badge>
        ) : null}
      </div>
    </Link>
  );
}
