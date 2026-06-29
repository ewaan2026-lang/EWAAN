import { createClient } from "@/lib/supabase/server";
import { getActiveOrgId } from "@/lib/org";

// تسجيل حدث في سجلّ النشاط (من فعل ماذا ومتى). لا يُفشل العملية الأساسية عند الخطأ.
export async function logAudit(input: {
  action: string;
  entityType?: string;
  entityId?: string | null;
  summary?: string;
}): Promise<void> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const orgId = await getActiveOrgId();
    if (!orgId) return;

    await supabase.from("audit_logs").insert({
      organization_id: orgId,
      actor_id: user?.id ?? null,
      action: input.action,
      entity_type: input.entityType ?? null,
      entity_id: input.entityId ?? null,
      changes: {
        summary: input.summary ?? null,
        actor_email: user?.email ?? null,
      },
    });
  } catch {
    /* تجاهل أخطاء التسجيل */
  }
}
