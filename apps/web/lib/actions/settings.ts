"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type OrgState = { error?: "name" | "generic"; ok?: boolean };

export async function updateOrgAction(
  locale: string,
  orgId: string,
  _prevState: OrgState,
  formData: FormData,
): Promise<OrgState> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "name" };

  const defaultLocale = String(formData.get("default_locale") ?? "ar") === "en" ? "en" : "ar";

  const supabase = await createClient();
  const { error } = await supabase
    .from("organizations")
    .update({
      name,
      legal_name: String(formData.get("legal_name") ?? "").trim() || null,
      cr_number: String(formData.get("cr_number") ?? "").trim() || null,
      vat_number: String(formData.get("vat_number") ?? "").trim() || null,
      email: String(formData.get("email") ?? "").trim() || null,
      phone: String(formData.get("phone") ?? "").trim() || null,
      default_locale: defaultLocale,
    })
    .eq("id", orgId);

  if (error) return { error: "generic" };

  revalidatePath(`/${locale}/settings`);
  return { ok: true };
}
