"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createPaymentInvoice } from "@/lib/moyasar";

export type PayState = { status?: "not_configured" | "error" };

// بدء دفع إلكتروني لدفعة مجدولة عبر Moyasar.
export async function startPaymentAction(
  locale: string,
  _prev: PayState,
  formData: FormData,
): Promise<PayState> {
  const scheduleId = String(formData.get("schedule_id") ?? "").trim();
  if (!scheduleId) return { status: "error" };

  const supabase = await createClient();
  const { data: sched } = await supabase
    .from("payment_schedules")
    .select("id, amount")
    .eq("id", scheduleId)
    .maybeSingle();
  if (!sched) return { status: "error" };

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const callbackUrl = `${site}/${locale}/pay/callback`;

  const result = await createPaymentInvoice({
    amountSar: sched.amount,
    description: "دفعة إيجار - إيوان",
    scheduleId: sched.id,
    callbackUrl,
  });

  if (result.skipped) return { status: "not_configured" };
  if (result.error || !result.url) return { status: "error" };

  redirect(result.url);
}
