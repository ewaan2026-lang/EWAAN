"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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

function pickStatus(formData: FormData): Enums<"unit_status"> {
  const raw = String(formData.get("status") ?? "");
  return UNIT_STATUSES.includes(raw as Enums<"unit_status">)
    ? (raw as Enums<"unit_status">)
    : "vacant";
}

export async function updateUnitAction(
  locale: string,
  unitId: string,
  propertyId: string,
  _prevState: UnitState,
  formData: FormData,
): Promise<UnitState> {
  const unitNumber = String(formData.get("unit_number") ?? "").trim();
  if (!unitNumber) return { error: "number" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("units")
    .update({
      unit_number: unitNumber,
      status: pickStatus(formData),
      floor: toNumber(formData.get("floor")),
      area_sqm: toNumber(formData.get("area_sqm")),
      bedrooms: toNumber(formData.get("bedrooms")),
      bathrooms: toNumber(formData.get("bathrooms")),
      base_rent: toNumber(formData.get("base_rent")),
      furnished: formData.get("furnished") === "on",
    })
    .eq("id", unitId);

  if (error) return { error: "generic" };

  revalidatePath(`/${locale}/properties/${propertyId}`);
  redirect(`/${locale}/properties/${propertyId}`);
}

export async function deleteUnitAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "").trim();
  const propertyId = String(formData.get("property_id") ?? "").trim();
  const locale = String(formData.get("locale") ?? "ar").trim() || "ar";
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("units").delete().eq("id", id);

  revalidatePath(`/${locale}/properties/${propertyId}`);
  redirect(`/${locale}/properties/${propertyId}`);
}
