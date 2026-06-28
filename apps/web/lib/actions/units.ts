"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrgId } from "@/lib/org";
import type { Enums } from "@ewaan/db";

export type UnitState = { error?: "number" | "generic"; ok?: boolean };

const UNIT_STATUSES: Enums<"unit_status">[] = [
  "vacant",
  "occupied",
  "reserved",
  "maintenance",
  "unavailable",
];

function toNumber(v: FormDataEntryValue | null): number | null {
  const s = String(v ?? "").trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export async function createUnitAction(
  locale: string,
  propertyId: string,
  _prevState: UnitState,
  formData: FormData,
): Promise<UnitState> {
  const unitNumber = String(formData.get("unit_number") ?? "").trim();
  if (!unitNumber) return { error: "number" };

  const orgId = await getActiveOrgId();
  if (!orgId) return { error: "generic" };

  const statusRaw = String(formData.get("status") ?? "");
  const status: Enums<"unit_status"> = UNIT_STATUSES.includes(
    statusRaw as Enums<"unit_status">,
  )
    ? (statusRaw as Enums<"unit_status">)
    : "vacant";

  const supabase = await createClient();
  const { error } = await supabase.from("units").insert({
    organization_id: orgId,
    property_id: propertyId,
    unit_number: unitNumber,
    status,
    floor: toNumber(formData.get("floor")),
    area_sqm: toNumber(formData.get("area_sqm")),
    bedrooms: toNumber(formData.get("bedrooms")),
    bathrooms: toNumber(formData.get("bathrooms")),
    base_rent: toNumber(formData.get("base_rent")),
    furnished: formData.get("furnished") === "on",
  });

  if (error) return { error: "generic" };

  revalidatePath(`/${locale}/properties/${propertyId}`);
  return { ok: true };
}
