"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";

export type ReminderState = {
  status?: "sent" | "skipped" | "no_email" | "error";
};

// إرسال تذكير بدفعة مستحقة للمستأجر عبر البريد، وتسجيله في الإشعارات إن أمكن.
export async function sendPaymentReminderAction(
  locale: string,
  _prev: ReminderState,
  formData: FormData,
): Promise<ReminderState> {
  const scheduleId = String(formData.get("schedule_id") ?? "").trim();
  if (!scheduleId) return { status: "error" };

  const supabase = await createClient();
  const { data: sched } = await supabase
    .from("payment_schedules")
    .select("id, amount, due_date, lease_id")
    .eq("id", scheduleId)
    .maybeSingle();
  if (!sched) return { status: "error" };

  const { data: lease } = await supabase
    .from("leases")
    .select("id, tenant_id, organization_id")
    .eq("id", sched.lease_id)
    .maybeSingle();
  if (!lease) return { status: "error" };

  const { data: tenant } = await supabase
    .from("tenants")
    .select("full_name, email, user_id")
    .eq("id", lease.tenant_id)
    .maybeSingle();
  if (!tenant?.email) return { status: "no_email" };

  const { data: org } = await supabase
    .from("organizations")
    .select("name")
    .eq("id", lease.organization_id)
    .maybeSingle();
  const orgName = org?.name ?? "";

  const amountFmt = new Intl.NumberFormat("ar-SA-u-nu-latn", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 0,
  }).format(sched.amount);

  const subject = `تذكير بدفعة مستحقة — ${orgName}`;
  const html = `
    <div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;color:#04342C;line-height:1.8">
      <p>عزيزي ${tenant.full_name}،</p>
      <p>نذكّرك بوجود دفعة إيجار مستحقة:</p>
      <p style="font-size:18px;font-weight:bold">المبلغ: ${amountFmt}<br/>تاريخ الاستحقاق: ${sched.due_date}</p>
      <p>نشكر لك تعاونك.</p>
      <p style="color:#888">${orgName}</p>
    </div>`;

  const result = await sendEmail({ to: tenant.email, subject, html });

  // تسجيل الإشعار إن كان المستأجر مرتبطاً بحساب مستخدم.
  if (tenant.user_id) {
    await supabase.from("notifications").insert({
      organization_id: lease.organization_id,
      user_id: tenant.user_id,
      channel: "email",
      status: result.ok ? "sent" : "failed",
      type: "payment_reminder",
      title: subject,
      body: `دفعة ${amountFmt} مستحقة بتاريخ ${sched.due_date}`,
      sent_at: result.ok ? new Date().toISOString() : null,
    });
  }

  revalidatePath(`/${locale}/payments`);

  if (result.skipped) return { status: "skipped" };
  if (!result.ok) return { status: "error" };
  return { status: "sent" };
}
