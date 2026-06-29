import {
  HomeIcon,
  BuildingIcon,
  MapPinIcon,
  KeyIcon,
  UsersIcon,
  LayersIcon,
  CardIcon,
  ReceiptIcon,
  WrenchIcon,
  ChartIcon,
  BellIcon,
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
  { key: "map", href: "/map", Icon: MapPinIcon },
  { key: "owners", href: "/owners", Icon: KeyIcon },
  { key: "tenants", href: "/tenants", Icon: UsersIcon },
  { key: "leases", href: "/leases", Icon: LayersIcon },
  { key: "payments", href: "/payments", Icon: CardIcon },
  { key: "invoices", href: "/invoices", Icon: ReceiptIcon },
  { key: "maintenance", href: "/maintenance", Icon: WrenchIcon },
  { key: "reports", href: "/reports", Icon: ChartIcon },
  { key: "alerts", href: "/alerts", Icon: BellIcon },
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
