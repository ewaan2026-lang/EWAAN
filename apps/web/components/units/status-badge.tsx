import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import type { Enums } from "@ewaan/db";

type Tone = "teal" | "green" | "amber" | "rose" | "slate" | "violet";

const tone: Record<Enums<"unit_status">, Tone> = {
  vacant: "amber",
  occupied: "green",
  reserved: "violet",
  maintenance: "teal",
  unavailable: "rose",
};

// شارة حالة الوحدة (server).
export async function UnitStatusBadge({
  status,
}: {
  status: Enums<"unit_status">;
}) {
  const t = await getTranslations("unitStatus");
  return (
    <Badge tone={tone[status]} dot>
      {t(status)}
    </Badge>
  );
}
