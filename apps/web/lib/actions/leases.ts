"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrgId } from "@/lib/org";
import type { Enums, TablesInsert } from "@ewaan/db";

export type LeaseState = {
  error?: "unit" | "tenant" | "dates" | "rent" | "generic";
};

const FREQ_MONTHS: Record<Enums<"payment_frequency">, number> = {
  monthly: 1,
  quarterly: 3,
  semi_annual: 6,
  annual: 12,
};

function pickEnum<T extends string>(value: string, allowed: T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

function toNumber(v: FormDataEntryValue | null): number | null {
  const s = String(v ?? "").trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function addMonths(date: Date, n: number): Date {
  const d = new Date(date.getTime());
  d.setUTCMonth(d.getUTCMonth() + n);
  return d;
}

function iso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// يولّد جدول دفعات: دفعة لكل فترة من البداية حتى النهاية حسب الدورية.
function buildSchedules(
  orgId: string,
  leaseId: string,
  start: string,
  end: string,
  amount: number,
  freq: Enums<"payment_frequency">,
): TablesInsert<"payment_schedules">[] {
  const step = FREQ_MONTHS[freq];
  const endDate = new Date(`${end}T00:00:00Z`);
  const rows: TablesInsert<"payment_schedules">[] = [];
  let cursor = new Date(`${start}T00:00:00Z`);
  let seq = 1;
  while (cursor <= endDate && seq <= 240) {
    rows.push({
      organization_id: orgId,
      lease_id: leaseId,
      sequence: seq,
      due_date: iso(cursor),
      amount,
    });
    cursor = addMonths(cursor, step);
    seq += 1;
  }
  return rows;
}

export async function createLeaseAction(
  locale: string,
  _prevState: LeaseState,
  formData: FormData,
): Promise<LeaseState> {
  const unitId = String(formData.get("unit_id") ?? "").trim();
  if (!unitId) return { error: "unit" };
  const tenantId = String(formData.get("tenant_id") ?? "").trim();
  if (!tenantId) return { error: "tenant" };

  const startDate = String(formData.get("start_date") ?? "").trim();
  const endDate = String(formData.get("end_date") ?? "").trim();
  if (!startDate || !endDate || endDate < startDate) return { error: "dates" };

  const rent = toNumber(formData.get("rent_amount"));
  if (rent == null || rent <= 0) return { error: "rent" };

  const orgId = await getActiveOrgId();
  if (!orgId) return { error: "generic" };

  const frequency = pickEnum<Enums<"payment_frequency">>(
    String(formData.get("payment_frequency") ?? ""),
    ["monthly", "quarterly", "semi_annual", "annual"],
    "monthly",
  );
  const status = pickEnum<Enums<"lease_status">>(
    String(formData.get("status") ?? ""),
    ["draft", "active"],
    "draft",
  );
  const lateFeeType = pickEnum<Enums<"late_fee_type">>(
    String(formData.get("late_fee_type") ?? ""),
    ["none", "percentage", "fixed"],
    "none",
  );

  const supabase = await createClient();
  const { data: lease, error } = await supabase
    .from("leases")
    .insert({
      organization_id: orgId,
      unit_id: unitId,
      tenant_id: tenantId,
      contract_number: String(formData.get("contract_number") ?? "").trim() || null,
      start_date: startDate,
      end_date: endDate,
      rent_amount: rent,
      payment_frequency: frequency,
      deposit_amount: toNumber(formData.get("deposit_amount")),
      late_fee_type: lateFeeType,
      late_fee_value: lateFeeType === "none" ? 0 : toNumber(formData.get("late_fee_value")),
      grace_period_days: toNumber(formData.get("grace_period_days")) ?? 0,
      auto_renew: formData.get("auto_renew") === "on",
      status,
    })
    .select("id")
    .single();

  if (error || !lease) return { error: "generic" };

  // جدول الدفعات
  const schedules = buildSchedules(orgId, lease.id, startDate, endDate, rent, frequency);
  if (schedules.length > 0) {
    await supabase.from("payment_schedules").insert(schedules);
  }

  // عقد نشط ← اجعل الوحدة مؤجّرة
  if (status === "active") {
    await supabase.from("units").update({ status: "occupied" }).eq("id", unitId);
  }

  revalidatePath(`/${locale}/leases`);
  redirect(`/${locale}/leases/${lease.id}`);
}
