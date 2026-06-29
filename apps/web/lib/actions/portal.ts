"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Enums } from "@ewaan/db";

export type PortalRequestState = { error?: "title" | "generic"; ok?: boolean };

const PRIORITIES: Enums<"maintenance_priority">[] = ["low", "medium", "high", "urgent"];

// رفع طلب صيانة من المستأجر (مسموح عبر RLS بعد ترحيل 0007).
export async function createTenantRequestAction(
  locale: string,
  _prevState: PortalRequestState,
  formData: FormData,
): Promise<PortalRequestState> {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "title" };

  const orgId = String(formData.get("organization_id") ?? "").trim();
  const unitId = String(formData.get("unit_id") ?? "").trim();
  const tenantId = String(formData.get("tenant_id") ?? "").trim();
  const leaseId = String(formData.get("lease_id") ?? "").trim() || null;
  if (!orgId || !unitId || !tenantId) return { error: "generic" };

  const priorityRaw = String(formData.get("priority") ?? "");
  const priority: Enums<"maintenance_priority"> = PRIORITIES.includes(
    priorityRaw as Enums<"maintenance_priority">,
  )
    ? (priorityRaw as Enums<"maintenance_priority">)
    : "medium";

  const supabase = await createClient();
  const { error } = await supabase.from("maintenance_requests").insert({
    organization_id: orgId,
    unit_id: unitId,
    tenant_id: tenantId,
    lease_id: leaseId,
    title,
    description: String(formData.get("description") ?? "").trim() || null,
    priority,
    status: "new",
  });

  if (error) return { error: "generic" };

  revalidatePath(`/${locale}/portal`);
  return { ok: true };
}
