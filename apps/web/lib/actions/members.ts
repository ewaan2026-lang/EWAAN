"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// تحديث دور عضو في المؤسسة (للمدير عبر RLS).
export async function updateMemberRoleAction(formData: FormData): Promise<void> {
  const memberId = String(formData.get("member_id") ?? "").trim();
  const roleId = String(formData.get("role_id") ?? "").trim();
  const locale = String(formData.get("locale") ?? "ar").trim() || "ar";
  if (!memberId || !roleId) return;

  const supabase = await createClient();
  await supabase.from("org_members").update({ role_id: roleId }).eq("id", memberId);

  revalidatePath(`/${locale}/settings`);
}

// إزالة عضو من المؤسسة.
export async function removeMemberAction(formData: FormData): Promise<void> {
  const memberId = String(formData.get("member_id") ?? "").trim();
  const locale = String(formData.get("locale") ?? "ar").trim() || "ar";
  if (!memberId) return;

  const supabase = await createClient();
  await supabase.from("org_members").delete().eq("id", memberId);

  revalidatePath(`/${locale}/settings`);
}
