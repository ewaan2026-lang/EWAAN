"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrgId } from "@/lib/org";

export type TenantState = { error?: "name" | "generic" };

export async function createTenantAction(
  locale: string,
  _prevState: TenantState,
  formData: FormData,
): Promise<TenantState> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  if (!fullName) return { error: "name" };

  const orgId = await getActiveOrgId();
  if (!orgId) return { error: "generic" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tenants")
    .insert({
      organization_id: orgId,
      full_name: fullName,
      phone: String(formData.get("phone") ?? "").trim() || null,
      email: String(formData.get("email") ?? "").trim() || null,
      national_id: String(formData.get("national_id") ?? "").trim() || null,
    })
    .select("id")
    .single();

  if (error || !data) return { error: "generic" };

  revalidatePath(`/${locale}/tenants`);
  redirect(`/${locale}/tenants/${data.id}`);
}
