import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";

// صفحة قسم قيد التطوير — ترويسة + حالة "قريباً" أنيقة.
export async function ComingSoon({
  title,
  icon,
}: {
  title: string;
  icon: ReactNode;
}) {
  const tc = await getTranslations("common");
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title={title} />
      <EmptyState
        icon={icon}
        title={tc("comingSoonTitle")}
        body={tc("comingSoonBody")}
        action={<Badge tone="amber">{tc("comingSoonTitle")}</Badge>}
      />
    </div>
  );
}
