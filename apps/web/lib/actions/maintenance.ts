"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrgId } from "@/lib/org";
import type { Enums } from "@ewaan/db";

export type RequestState = { error?: "unit" | "title" | "generic" };

const PRIORITIES: Enums<"maintenance_priority">[] = ["low", "medium", "high", "urgent"];
const STATUSES: Enums<"maintenance_status">[] = [
  "new",
  "assigned",
  "in_progress",
  "on_hold",
  "completed",
  "cancelled",
];

function pick<T extends string>(v: string, allowed: T[], fallback: T): T {
  return allowed.includes(v as T) ? (v as T) : fallback;
}

export async function createRequestAction(
  locale: string,
  _prevState: RequestState,
  formData: FormData,
): Promise<RequestState> {
  const unitId = String(formData.get("unit_id") ?? "").trim();
  if (!unitId) return { error: "unit" };
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "title" };

  const orgId = await getActiveOrgId();
  if (!orgId) return { error: "generic" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("maintenance_requests")
    .insert({
      organization_id: orgId,
      unit_id: unitId,
      title,
      description: String(formData.get("description") ?? "").trim() || null,
      category: String(formData.get("category") ?? "").trim() || null,
      priority: pick(String(formData.get("priority") ?? ""), PRIORITIES, "medium"),
      status: "new",
    })
    .select("id")
    .single();

  if (error || !data) return { error: "generic" };

  revalidatePath(`/${locale}/maintenance`);
  redirect(`/${locale}/maintenance/${data.id}`);
}

export async function updateRequestStatusAction(formData: FormData): Promise<void> {
  const id = String(formData.get("request_id") ?? "").trim();
  const locale = String(formData.get("locale") ?? "ar").trim() || "ar";
  if (!id) return;

  const status = pick(String(formData.get("status") ?? ""), STATUSES, "new");
  const supabase = await createClient();
  await supabase.from("maintenance_requests").update({ status }).eq("id", id);

  revalidatePath(`/${locale}/maintenance/${id}`);
  revalidatePath(`/${locale}/maintenance`);
}
