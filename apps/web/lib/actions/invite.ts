"use server";

import { createClient } from "@/lib/supabase/server";
import { getActiveOrgId } from "@/lib/org";
import { sendEmail } from "@/lib/email";
import { logAudit } from "@/lib/audit";

export type InviteState = {
  status?: "sent" | "skipped" | "invalid" | "error";
};

// إرسال دعوة للانضمام إلى المؤسسة عبر البريد (رابط الدخول للمنصّة).
export async function inviteMemberAction(
  locale: string,
  _prev: InviteState,
  formData: FormData,
): Promise<InviteState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email || !email.includes("@")) return { status: "invalid" };

  const orgId = await getActiveOrgId();
  if (!orgId) return { status: "error" };

  const supabase = await createClient();
  const { data: org } = await supabase
    .from("organizations")
    .select("name")
    .eq("id", orgId)
    .maybeSingle();
  const orgName = org?.name ?? "إيوان";

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const joinUrl = `${site}/${locale}/login`;

  const subject = `دعوة للانضمام إلى ${orgName} على منصّة إيوان`;
  const html = `
    <div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;color:#04342C;line-height:1.9">
      <p>مرحباً،</p>
      <p>تمت دعوتك للانضمام إلى <strong>${orgName}</strong> على منصّة إيوان لإدارة الأملاك.</p>
      <p><a href="${joinUrl}" style="display:inline-block;background:#00809D;color:#fff;padding:10px 22px;border-radius:10px;text-decoration:none;font-weight:bold">الدخول إلى المنصّة</a></p>
      <p style="color:#888">بعد تسجيلك، سيقوم المسؤول بإسناد دورك داخل المؤسسة.</p>
      <p style="color:#888">${orgName}</p>
    </div>`;

  const result = await sendEmail({ to: email, subject, html });

  await logAudit({
    action: "invite",
    entityType: "member",
    summary: `أرسل دعوة انضمام إلى ${email}`,
  });

  if (result.skipped) return { status: "skipped" };
  if (!result.ok) return { status: "error" };
  return { status: "sent" };
}
