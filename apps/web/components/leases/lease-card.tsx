import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LeaseStatusBadge } from "@/components/leases/status-badge";
import { DoorIcon, UsersIcon } from "@/components/ui/icons";
import type { Enums } from "@ewaan/db";

export type LeaseCardData = {
  id: string;
  contract_number: string | null;
  status: Enums<"lease_status">;
  rent_amount: number;
  start_date: string;
  end_date: string;
  unitLabel: string;
  tenantName: string;
};

export async function LeaseCard({
  lease,
  locale,
}: {
  lease: LeaseCardData;
  locale: string;
}) {
  const t = await getTranslations("leases.labels");
  const rent = new Intl.NumberFormat(locale === "ar" ? "ar-SA-u-nu-latn" : "en-US", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 0,
  }).format(lease.rent_amount);

  return (
    <Link
      href={`/leases/${lease.id}`}
      className="group flex flex-col rounded-2xl border border-brand-teal/10 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:border-brand-teal/25 hover:shadow-lg"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[15px] font-extrabold text-brand-teal-900">
          {lease.contract_number ?? `#${lease.id.slice(0, 8)}`}
        </p>
        <LeaseStatusBadge status={lease.status} />
      </div>

      <div className="mt-3 space-y-1.5">
        <p className="flex items-center gap-2 text-sm text-brand-teal-900/70">
          <DoorIcon className="h-4 w-4 shrink-0 text-brand-teal" />
          <span className="truncate">{lease.unitLabel}</span>
        </p>
        <p className="flex items-center gap-2 text-sm text-brand-teal-900/70">
          <UsersIcon className="h-4 w-4 shrink-0 text-brand-teal" />
          <span className="truncate">{lease.tenantName}</span>
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-brand-teal/8 pt-3.5">
        <span className="text-xs text-brand-teal-900/45" dir="ltr">
          {lease.start_date} → {lease.end_date}
        </span>
        <span className="text-sm font-bold text-brand-teal-900" dir="ltr">
          {rent}
          <span className="ms-1 text-[11px] font-medium text-brand-teal-900/45">
            / {t("installment")}
          </span>
        </span>
      </div>
    </Link>
  );
}
