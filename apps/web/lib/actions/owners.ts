"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrgId } from "@/lib/org";

export type OwnerState = { error?: "name" | "generic" };

function toNumber(v: FormDataEntryValue | null): number | null {
  const s = String(v ?? "").trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
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
    .insert({
      organization_id: orgId,
      full_name: fullName,
      phone: String(formData.get("phone") ?? "").trim() || null,
      email: String(formData.get("email") ?? "").trim() || null,
      national_id: String(formData.get("national_id") ?? "").trim() || null,
      iban: String(formData.get("iban") ?? "").trim() || null,
      commission_rate: toNumber(formData.get("commission_rate")),
      notes: String(formData.get("notes") ?? "").trim() || null,
    })
    .select("id")
    .single();

  if (error || !data) return { error: "generic" };

  revalidatePath(`/${locale}/owners`);
  redirect(`/${locale}/owners/${data.id}`);
}
