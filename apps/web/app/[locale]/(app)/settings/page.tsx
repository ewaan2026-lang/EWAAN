import { getTranslations, setRequestLocale } from "next-intl/server";
import { ComingSoon } from "@/components/ui/coming-soon";
import { SettingsIcon } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("nav");
  return <ComingSoon title={t("settings")} icon={<SettingsIcon className="h-7 w-7" />} />;
}
