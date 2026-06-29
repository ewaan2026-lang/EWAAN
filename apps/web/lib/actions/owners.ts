"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrgId } from "@/lib/org";

export type OwnerState = {
  error?: "name" | "generic";
  created?: { id: string; label: string };
};

function toNumber(v: FormDataEntryValue | null): number | null {
  const s = String(v ?? "").trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function parseOwner(formData: FormData) {
  return {
    phone: String(formData.get("phone") ?? "").trim() || null,
    email: String(formData.get("email") ?? "").trim() || null,
    national_id: String(formData.get("national_id") ?? "").trim() || null,
    iban: String(formData.get("iban") ?? "").trim() || null,
    commission_rate: toNumber(formData.get("commission_rate")),
    notes: String(formData.get("notes") ?? "").trim() || null,
  };
}

export async function createOwnerAction(
  locale: string,
  _prevState: OwnerState,
  formData: FormData,
): Promise<OwnerState> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  if (!fullName) return { error: "name" };

  const orgId = await getActiveOrgId();
  if (!orgId) return { error: "generic" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("owners")
    .insert({ organization_id: orgId, full_name: fullName, ...parseOwner(formData) })
    .select("id")
    .single();

  if (error || !data) return { error: "generic" };

  revalidatePath(`/${locale}/owners`);

  if (String(formData.get("__modal") ?? "") === "1") {
    return { created: { id: data.id, label: fullName } };
  }
  redirect(`/${locale}/owners/${data.id}`);
}

export async function updateOwnerAction(
  locale: string,
  id: string,
  _prevState: OwnerState,
  formData: FormData,
): Promise<OwnerState> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  if (!fullName) return { error: "name" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("owners")
    .update({ full_name: fullName, ...parseOwner(formData) })
    .eq("id", id);

  if (error) return { error: "generic" };

  revalidatePath(`/${locale}/owners`);
  revalidatePath(`/${locale}/owners/${id}`);
  redirect(`/${locale}/owners/${id}`);
}

export async function deleteOwnerAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "").trim();
  const locale = String(formData.get("locale") ?? "ar").trim() || "ar";
  if (!id) return;

  const supabase = await createClient();
  const { error } = await supabase.from("owners").delete().eq("id", id);

  if (error) redirect(`/${locale}/owners/${id}`);
  revalidatePath(`/${locale}/owners`);
  redirect(`/${locale}/owners`);
}
