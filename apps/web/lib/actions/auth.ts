"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: "invalid" | "generic" };

export async function signInAction(
  locale: string,
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const invalid = /invalid|credentials/i.test(error.message);
    return { error: invalid ? "invalid" : "generic" };
  }

  redirect(`/${locale}/dashboard`);
}

export async function signOutAction(locale: string): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(`/${locale}/login`);
}

export async function createOrgAction(
  locale: string,
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "generic" };

  const supabase = await createClient();
  const { error } = await supabase.rpc("create_organization", { p_name: name });
  if (error) return { error: "generic" };

  redirect(`/${locale}/dashboard`);
}
