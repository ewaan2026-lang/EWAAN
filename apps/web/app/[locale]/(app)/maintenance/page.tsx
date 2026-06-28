import { getTranslations, setRequestLocale } from "next-intl/server";
import { ComingSoon } from "@/components/ui/coming-soon";
import { WrenchIcon } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

export default async function MaintenancePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("nav");
  return <ComingSoon title={t("maintenance")} icon={<WrenchIcon className="h-7 w-7" />} />;
}
