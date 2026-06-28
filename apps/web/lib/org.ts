import { createClient } from "@/lib/supabase/server";

// مُعرّف المؤسسة النشطة للمستخدم الحالي (أول عضوية — RLS يقصرها على مؤسساته).
export async function getActiveOrgId(): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("org_members")
    .select("organization_id")
    .limit(1)
    .maybeSingle();
  return data?.organization_id ?? null;
}
