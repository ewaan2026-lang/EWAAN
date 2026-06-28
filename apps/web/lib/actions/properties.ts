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

export async function createPropertyAction(
  locale: string,
  _prevState: PropertyState,
  formData: FormData,
): Promise<PropertyState> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "name" };

  const orgId = await getActiveOrgId();
  if (!orgId) return { error: "generic" };

  const typeRaw = String(formData.get("property_type") ?? "");
  const property_type: Enums<"property_type"> = PROPERTY_TYPES.includes(
    typeRaw as Enums<"property_type">,
  )
    ? (typeRaw as Enums<"property_type">)
    : "residential_building";

  const city = String(formData.get("city") ?? "").trim();
  const district = String(formData.get("district") ?? "").trim();
  const nationalAddress = String(formData.get("national_address") ?? "").trim();
  const deedNumber = String(formData.get("deed_number") ?? "").trim();
  const ownerId = String(formData.get("owner_id") ?? "").trim();

  const address =
    city || district ? { city: city || null, district: district || null } : null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .insert({
      organization_id: orgId,
      name,
      property_type,
      address,
      national_address: nationalAddress || null,
      deed_number: deedNumber || null,
      owner_id: ownerId || null,
    })
    .select("id")
    .single();

  if (error || !data) return { error: "generic" };

  revalidatePath(`/${locale}/properties`);
  redirect(`/${locale}/properties/${data.id}`);
}
