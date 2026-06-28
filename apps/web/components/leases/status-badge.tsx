import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import type { Enums } from "@ewaan/db";

type Tone = "teal" | "green" | "amber" | "rose" | "slate" | "violet";

const leaseTone: Record<Enums<"lease_status">, Tone> = {
  draft: "slate",
  active: "green",
  expired: "amber",
  terminated: "rose",
  renewed: "teal",
};

export async function LeaseStatusBadge({
  status,
}: {
  status: Enums<"lease_status">;
}) {
  const t = await getTranslations("leaseStatus");
  return (
    <Badge tone={leaseTone[status]} dot>
      {t(status)}
    </Badge>
  );
}

const scheduleTone: Record<Enums<"schedule_status">, Tone> = {
  pending: "slate",
  invoiced: "violet",
  paid: "green",
  overdue: "rose",
  waived: "amber",
};

export async function ScheduleStatusBadge({
  status,
}: {
  status: Enums<"schedule_status">;
}) {
  const t = await getTranslations("scheduleStatus");
  return <Badge tone={scheduleTone[status]}>{t(status)}</Badge>;
}
