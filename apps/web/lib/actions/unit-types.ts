"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrgId } from "@/lib/org";

export async function createUnitTypeAction(formData: FormData): Promise<void> {
  const name = String(formData.get("name") ?? "").trim();
  const locale = String(formData.get("locale") ?? "ar").trim() || "ar";
  if (!name) return;

  const orgId = await getActiveOrgId();
  if (!orgId) return;

  const supabase = await createClient();
  await supabase.from("unit_types").insert({
    organization_id: orgId,
    name,
    description: String(formData.get("description") ?? "").trim() || null,
  });

  revalidatePath(`/${locale}/settings`);
}

export async function deleteUnitTypeAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "").trim();
  const locale = String(formData.get("locale") ?? "ar").trim() || "ar";
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("unit_types").delete().eq("id", id);

  revalidatePath(`/${locale}/settings`);
}
