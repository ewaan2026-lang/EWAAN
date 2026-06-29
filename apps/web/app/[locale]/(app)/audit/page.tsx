import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ClockIcon } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

export default async function AuditPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("audit");
  const intlLocale = locale === "ar" ? "ar-SA-u-nu-latn" : "en-US";

  const supabase = await createClient();
  const { data: logs } = await supabase
    .from("audit_logs")
    .select("id, action, entity_type, changes, created_at, actor_id")
    .order("created_at", { ascending: false })
    .limit(100);

  const rows = logs ?? [];
  const fmtTime = (s: string) =>
    new Intl.DateTimeFormat(intlLocale, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(s));

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      {rows.length === 0 ? (
        <EmptyState
          icon={<ClockIcon className="h-7 w-7" />}
          title={t("emptyTitle")}
          body={t("emptyBody")}
        />
      ) : (
        <div className="relative overflow-hidden rounded-2xl border border-brand-teal/10 bg-white shadow-luxe">
          <span className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-gold via-brand-brass to-brand-gold opacity-90" />
          {rows.map((r, i) => {
            const ch = (r.changes ?? {}) as { summary?: string | null; actor_email?: string | null };
            const actor = ch.actor_email || t("system");
            return (
              <div
                key={r.id}
                className={`flex items-start justify-between gap-3 px-5 py-3.5 ${
                  i > 0 ? "border-t border-brand-teal/8" : ""
                }`}
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-teal/10 text-brand-teal">
                    <ClockIcon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-brand-teal-900">
                      {ch.summary || `${r.action} · ${r.entity_type ?? ""}`}
                    </p>
                    <p className="mt-0.5 text-xs text-brand-teal-900/50">
                      {t("by")} {actor}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 text-xs font-medium text-brand-teal-900/45" dir="ltr">
                  {fmtTime(r.created_at)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
