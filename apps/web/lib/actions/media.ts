"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// حذف وسيط: يزيل الملف من المخزن وسجلّه من الجدول.
export async function deleteMediaAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "").trim();
  const storagePath = String(formData.get("storage_path") ?? "").trim();
  const locale = String(formData.get("locale") ?? "ar").trim() || "ar";
  const redirectPath = String(formData.get("redirect_path") ?? "").trim();
  if (!id) return;

  const supabase = await createClient();
  if (storagePath) {
    await supabase.storage.from("media").remove([storagePath]);
  }
  await supabase.from("media").delete().eq("id", id);

  if (redirectPath) revalidatePath(`/${locale}${redirectPath}`);
}
