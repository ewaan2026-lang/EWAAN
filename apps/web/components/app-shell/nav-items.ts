import {
  HomeIcon,
  BuildingIcon,
  KeyIcon,
  UsersIcon,
  LayersIcon,
  CardIcon,
  WrenchIcon,
  ChartIcon,
  SettingsIcon,
} from "@/components/ui/icons";

export type NavItem = {
  key: string;
  href: string;
  Icon: typeof HomeIcon;
};

// عناصر التنقّل الرئيسية (المفتاح يطابق مفاتيح ترجمة "nav").
export const NAV: NavItem[] = [
  { key: "overview", href: "/dashboard", Icon: HomeIcon },
  { key: "properties", href: "/properties", Icon: BuildingIcon },
  { key: "owners", href: "/owners", Icon: KeyIcon },
  { key: "tenants", href: "/tenants", Icon: UsersIcon },
  { key: "leases", href: "/leases", Icon: LayersIcon },
  { key: "payments", href: "/payments", Icon: CardIcon },
  { key: "maintenance", href: "/maintenance", Icon: WrenchIcon },
  { key: "reports", href: "/reports", Icon: ChartIcon },
  { key: "settings", href: "/settings", Icon: SettingsIcon },
];

// التنقّل المختصر لشريط الجوال السفلي.
export const PRIMARY_KEYS = [
  "overview",
  "properties",
  "leases",
  "payments",
  "maintenance",
];
