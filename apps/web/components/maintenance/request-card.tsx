import { Link } from "@/i18n/navigation";
import { PriorityBadge, MaintenanceStatusBadge } from "@/components/maintenance/badges";
import { DoorIcon, WrenchIcon } from "@/components/ui/icons";
import type { Enums } from "@ewaan/db";

export type RequestCardData = {
  id: string;
  title: string;
  priority: Enums<"maintenance_priority">;
  status: Enums<"maintenance_status">;
  category: string | null;
  unitLabel: string;
};

export function RequestCard({ request }: { request: RequestCardData }) {
  return (
    <Link
      href={`/maintenance/${request.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-brand-teal/10 bg-white p-5 shadow-card transition duration-300 hover:-translate-y-1 hover:border-brand-brass/35 hover:shadow-luxe"
    >
      <span className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-gold via-brand-brass to-brand-gold opacity-0 transition group-hover:opacity-90" />
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-teal/10 text-brand-teal">
            <WrenchIcon className="h-[18px] w-[18px]" />
          </span>
          <h3 className="truncate text-[15px] font-bold text-brand-teal-900">
            {request.title}
          </h3>
        </div>
        <PriorityBadge priority={request.priority} />
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-xs text-brand-teal-900/55">
        <DoorIcon className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{request.unitLabel}</span>
      </p>

      <div className="mt-4 flex items-center justify-between border-t border-brand-teal/8 pt-3.5">
        <MaintenanceStatusBadge status={request.status} />
        {request.category ? (
          <span className="truncate text-xs text-brand-teal-900/45">{request.category}</span>
        ) : null}
      </div>
    </Link>
  );
}
