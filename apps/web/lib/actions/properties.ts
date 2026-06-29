"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrgId } from "@/lib/org";
import type { Enums } from "@ewaan/db";

export type PropertyState = { error?: "name" | "generic" };

const PROPERTY_TYPES: Enums<"property_type">[] = [
  "residential_building",
  "villa",
  "floor",
  "studio",
  "apartment",
  "compound",
  "tower",
  "other",
];

function parseProperty(formData: FormData) {
  const typeRaw = String(formData.get("property_type") ?? "");
  const property_type: Enums<"property_type"> = PROPERTY_TYPES.includes(
    typeRaw as Enums<"property_type">,
  )
    ? (typeRaw as Enums<"property_type">)
    : "residential_building";

  const city = String(formData.get("city") ?? "").trim();
  const district = String(formData.get("district") ?? "").trim();
  const street = String(formData.get("street") ?? "").trim();
  const buildingNumber = String(formData.get("building_number") ?? "").trim();
  const nationalAddress = String(formData.get("national_address") ?? "").trim();
  const deedNumber = String(formData.get("deed_number") ?? "").trim();
  const ownerId = String(formData.get("owner_id") ?? "").trim();
  const services = String(formData.get("services") ?? "")
    .split(/[,،]/)
    .map((s) => s.trim())
    .filter(Boolean);

  const latRaw = parseFloat(String(formData.get("latitude") ?? ""));
  const lngRaw = parseFloat(String(formData.get("longitude") ?? ""));
  const latitude =
    Number.isFinite(latRaw) && latRaw >= -90 && latRaw <= 90 ? latRaw : null;
  const longitude =
    Number.isFinite(lngRaw) && lngRaw >= -180 && lngRaw <= 180 ? lngRaw : null;

  const hasAddress = city || district || street || buildingNumber;

  return {
    property_type,
    address: hasAddress
      ? {
          city: city || null,
          district: district || null,
          street: street || null,
          building_number: buildingNumber || null,
        }
      : null,
    national_address: nationalAddress || null,
    deed_number: deedNumber || null,
    owner_id: ownerId || null,
    services,
    whatsapp_group_url: String(formData.get("whatsapp_group_url") ?? "").trim() || null,
    latitude,
    longitude,
  };
}

export async function createPropertyAction(
  locale: string,
  _prevState: PropertyState,
  formData: FormData,
): Promise<PropertyState> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "name" };

  const orgId = await getActiveOrgId();
  if (!orgId) return { error: "generic" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .insert({ organization_id: orgId, name, ...parseProperty(formData) })
    .select("id")
    .single();

  if (error || !data) return { error: "generic" };

  revalidatePath(`/${locale}/properties`);
  redirect(`/${locale}/properties/${data.id}`);
}

export async function updatePropertyAction(
  locale: string,
  id: string,
  _prevState: PropertyState,
  formData: FormData,
): Promise<PropertyState> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "name" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("properties")
    .update({ name, ...parseProperty(formData) })
    .eq("id", id);

  if (error) return { error: "generic" };

  revalidatePath(`/${locale}/properties`);
  revalidatePath(`/${locale}/properties/${id}`);
  redirect(`/${locale}/properties/${id}`);
}

export async function deletePropertyAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "").trim();
  const locale = String(formData.get("locale") ?? "ar").trim() || "ar";
  if (!id) return;

  const supabase = await createClient();
  const { error } = await supabase.from("properties").delete().eq("id", id);

  if (error) redirect(`/${locale}/properties/${id}`);
  revalidatePath(`/${locale}/properties`);
  redirect(`/${locale}/properties`);
}
