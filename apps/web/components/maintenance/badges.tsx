import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import type { Enums } from "@ewaan/db";

type Tone = "teal" | "green" | "amber" | "rose" | "slate" | "violet";

const priorityTone: Record<Enums<"maintenance_priority">, Tone> = {
  low: "slate",
  medium: "teal",
  high: "amber",
  urgent: "rose",
};

export async function PriorityBadge({
  priority,
}: {
  priority: Enums<"maintenance_priority">;
}) {
  const t = await getTranslations("maintenancePriority");
  return (
    <Badge tone={priorityTone[priority]} dot>
      {t(priority)}
    </Badge>
  );
}

const statusTone: Record<Enums<"maintenance_status">, Tone> = {
  new: "violet",
  assigned: "teal",
  in_progress: "amber",
  on_hold: "slate",
  completed: "green",
  cancelled: "rose",
};

export async function MaintenanceStatusBadge({
  status,
}: {
  status: Enums<"maintenance_status">;
}) {
  const t = await getTranslations("maintenanceStatus");
  return <Badge tone={statusTone[status]}>{t(status)}</Badge>;
}
