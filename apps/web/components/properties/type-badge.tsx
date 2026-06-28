import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import type { Enums } from "@ewaan/db";

type Tone = "teal" | "green" | "amber" | "rose" | "slate" | "violet";

const tone: Record<Enums<"property_type">, Tone> = {
  residential_building: "teal",
  tower: "teal",
  villa: "green",
  compound: "violet",
  apartment: "slate",
  studio: "slate",
  floor: "slate",
  other: "slate",
};

// شارة نوع العقار (server) — تُترجم النوع وتلوّنه.
export async function PropertyTypeBadge({
  type,
}: {
  type: Enums<"property_type">;
}) {
  const t = await getTranslations("propertyTypes");
  return <Badge tone={tone[type]}>{t(type)}</Badge>;
}
