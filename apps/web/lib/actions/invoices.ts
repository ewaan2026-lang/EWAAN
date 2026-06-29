"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrgId } from "@/lib/org";
import { logAudit } from "@/lib/audit";
import { zatcaQrPayload } from "@/lib/zatca";
import type { Enums } from "@ewaan/db";

export type InvoiceState = { error?: "tenant" | "amount" | "generic" };

const TYPES: Enums<"invoice_type">[] = [
  "rent",
  "management_fee",
  "service",
  "deposit",
  "other",
];

export async function createInvoiceAction(
  locale: string,
  _prev: InvoiceState,
  formData: FormData,
): Promise<InvoiceState> {
  const tenantId = String(formData.get("tenant_id") ?? "").trim();
  if (!tenantId) return { error: "tenant" };

  const subtotal = Number(formData.get("subtotal") ?? "");
  if (!Number.isFinite(subtotal) || subtotal <= 0) return { error: "amount" };

  const typeRaw = String(formData.get("type") ?? "");
  const type: Enums<"invoice_type"> = TYPES.includes(typeRaw as Enums<"invoice_type">)
    ? (typeRaw as Enums<"invoice_type">)
    : "rent";

  const vatRate = Number(formData.get("vat_rate") ?? "15");
  const rate = Number.isFinite(vatRate) && vatRate >= 0 ? vatRate : 15;
  const taxAmount = Math.round(subtotal * (rate / 100) * 100) / 100;
  const total = Math.round((subtotal + taxAmount) * 100) / 100;

  const issueDate =
    String(formData.get("issue_date") ?? "").trim() ||
    new Date().toISOString().slice(0, 10);
  const dueDate = String(formData.get("due_date") ?? "").trim() || null;
  const leaseId = String(formData.get("lease_id") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  const orgId = await getActiveOrgId();
  if (!orgId) return { error: "generic" };

  const supabase = await createClient();

  const [{ data: org }, { count }] = await Promise.all([
    supabase
      .from("organizations")
      .select("name, legal_name, vat_number")
      .eq("id", orgId)
      .maybeSingle(),
    supabase
      .from("invoices")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", orgId),
  ]);

  const seq = (count ?? 0) + 1;
  const year = issueDate.slice(0, 4);
  const invoiceNumber = `INV-${year}-${String(seq).padStart(5, "0")}`;

  const timestamp = new Date().toISOString();
  const qr = zatcaQrPayload({
    sellerName: org?.legal_name || org?.name || "—",
    vatNumber: org?.vat_number || "—",
    timestamp,
    total: total.toFixed(2),
    vatTotal: taxAmount.toFixed(2),
  });

  const { data, error } = await supabase
    .from("invoices")
    .insert({
      organization_id: orgId,
      tenant_id: tenantId,
      lease_id: leaseId,
      invoice_number: invoiceNumber,
      type,
      status: "issued",
      issue_date: issueDate,
      due_date: dueDate,
      subtotal,
      tax_amount: taxAmount,
      total,
      currency: "SAR",
      notes,
      zatca_qr: qr,
      zatca_uuid: crypto.randomUUID(),
    })
    .select("id")
    .single();

  if (error || !data) return { error: "generic" };

  await logAudit({
    action: "create",
    entityType: "invoice",
    entityId: data.id,
    summary: `أصدر فاتورة ${invoiceNumber} بإجمالي ${total} ر.س`,
  });

  revalidatePath(`/${locale}/invoices`);
  redirect(`/${locale}/invoices/${data.id}`);
}

export async function deleteInvoiceAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "").trim();
  const locale = String(formData.get("locale") ?? "ar").trim() || "ar";
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("invoices").delete().eq("id", id);
  revalidatePath(`/${locale}/invoices`);
  redirect(`/${locale}/invoices`);
}
