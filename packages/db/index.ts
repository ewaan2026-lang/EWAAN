// نقطة التصدير الموحّدة لطبقة البيانات
// الأنواع مُولّدة من قاعدة بيانات Supabase الحيّة (لا تعدّلها يدوياً).
// أعد توليدها عبر: pnpm db:types
export type {
  Database,
  Tables,
  TablesInsert,
  TablesUpdate,
  Enums,
  Json,
} from "./types";
export { Constants } from "./types";

import type { Database } from "./types";

// اختصارات مريحة لأكثر الكيانات استخداماً
export type Organization = Database["public"]["Tables"]["organizations"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Property = Database["public"]["Tables"]["properties"]["Row"];
export type Unit = Database["public"]["Tables"]["units"]["Row"];
export type Lease = Database["public"]["Tables"]["leases"]["Row"];
export type Tenant = Database["public"]["Tables"]["tenants"]["Row"];
export type Invoice = Database["public"]["Tables"]["invoices"]["Row"];
export type Payment = Database["public"]["Tables"]["payments"]["Row"];
export type MaintenanceRequest =
  Database["public"]["Tables"]["maintenance_requests"]["Row"];
