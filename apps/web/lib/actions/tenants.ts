"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrgId } from "@/lib/org";

export type TenantState = { error?: "name" | "generic" };

function parseTenant(formData: FormData) {
  return {
    phone: String(formData.get("phone") ?? "").trim() || null,
    email: String(formData.get("email") ?? "").trim() || null,
    national_id: String(formData.get("national_id") ?? "").trim() || null,
  };
}

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
    .insert({ organization_id: orgId, full_name: fullName, ...parseTenant(formData) })
    .select("id")
    .single();

  if (error || !data) return { error: "generic" };

  revalidatePath(`/${locale}/tenants`);
  redirect(`/${locale}/tenants/${data.id}`);
}

export async function updateTenantAction(
  locale: string,
  id: string,
  _prevState: TenantState,
  formData: FormData,
): Promise<TenantState> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  if (!fullName) return { error: "name" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("tenants")
    .update({ full_name: fullName, ...parseTenant(formData) })
    .eq("id", id);

  if (error) return { error: "generic" };

  revalidatePath(`/${locale}/tenants`);
  revalidatePath(`/${locale}/tenants/${id}`);
  redirect(`/${locale}/tenants/${id}`);
}

export async function deleteTenantAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "").trim();
  const locale = String(formData.get("locale") ?? "ar").trim() || "ar";
  if (!id) return;

  const supabase = await createClient();
  const { error } = await supabase.from("tenants").delete().eq("id", id);

  if (error) redirect(`/${locale}/tenants/${id}`);
  revalidatePath(`/${locale}/tenants`);
  redirect(`/${locale}/tenants`);
}
