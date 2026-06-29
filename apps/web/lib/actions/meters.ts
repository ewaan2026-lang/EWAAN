"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrgId } from "@/lib/org";
import type { Enums } from "@ewaan/db";

function revalidate(locale: string, redirectPath: string) {
  if (redirectPath) revalidatePath(`/${locale}${redirectPath}`);
}

export async function createMeterAction(formData: FormData): Promise<void> {
  const unitId = String(formData.get("unit_id") ?? "").trim();
  const locale = String(formData.get("locale") ?? "ar").trim() || "ar";
  const redirectPath = String(formData.get("redirect_path") ?? "").trim();
  if (!unitId) return;

  const orgId = await getActiveOrgId();
  if (!orgId) return;

  const typeRaw = String(formData.get("type") ?? "");
  const type: Enums<"meter_type"> = typeRaw === "water" ? "water" : "electricity";

  const supabase = await createClient();
  await supabase.from("meters").insert({
    organization_id: orgId,
    unit_id: unitId,
    type,
    meter_number: String(formData.get("meter_number") ?? "").trim() || null,
  });

  revalidate(locale, redirectPath);
}

export async function deleteMeterAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "").trim();
  const locale = String(formData.get("locale") ?? "ar").trim() || "ar";
  const redirectPath = String(formData.get("redirect_path") ?? "").trim();
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("meters").delete().eq("id", id);

  revalidate(locale, redirectPath);
}

export async function addReadingAction(formData: FormData): Promise<void> {
  const meterId = String(formData.get("meter_id") ?? "").trim();
  const locale = String(formData.get("locale") ?? "ar").trim() || "ar";
  const redirectPath = String(formData.get("redirect_path") ?? "").trim();
  const reading = Number(String(formData.get("reading") ?? "").trim());
  if (!meterId || !Number.isFinite(reading)) return;

  const orgId = await getActiveOrgId();
  if (!orgId) return;

  const date = String(formData.get("reading_date") ?? "").trim();

  const supabase = await createClient();
  await supabase.from("meter_readings").insert({
    organization_id: orgId,
    meter_id: meterId,
    reading,
    ...(date ? { reading_date: date } : {}),
  });

  revalidate(locale, redirectPath);
}
