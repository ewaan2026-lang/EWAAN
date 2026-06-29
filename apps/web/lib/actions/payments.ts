"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// تسجيل تحصيل دفعة مجدولة: ينشئ سجل دفعة ويعلّم الدفعة "مدفوعة".
export async function recordPaymentAction(formData: FormData): Promise<void> {
  const scheduleId = String(formData.get("schedule_id") ?? "").trim();
  const locale = String(formData.get("locale") ?? "ar").trim() || "ar";
  if (!scheduleId) return;

  const supabase = await createClient();

  const { data: schedule } = await supabase
    .from("payment_schedules")
    .select("id, amount, lease_id, organization_id, status")
    .eq("id", scheduleId)
    .maybeSingle();

  if (!schedule || schedule.status === "paid") return;

  const { data: lease } = await supabase
    .from("leases")
    .select("tenant_id")
    .eq("id", schedule.lease_id)
    .maybeSingle();

  await supabase.from("payments").insert({
    organization_id: schedule.organization_id,
    lease_id: schedule.lease_id,
    tenant_id: lease?.tenant_id ?? null,
    amount: schedule.amount,
    status: "completed",
    paid_at: new Date().toISOString(),
  });

  await supabase
    .from("payment_schedules")
    .update({ status: "paid" })
    .eq("id", scheduleId);

  revalidatePath(`/${locale}/payments`);
}
