// تكامل بوابة الدفع Moyasar — مُفعَّل بمتغيّر البيئة MOYASAR_SECRET_KEY.
// يعمل في وضع الاختبار بمفاتيح test، ويُحوَّل للإنتاج بمفاتيح live دون تغيير الكود.

export type InvoiceResult = { url?: string; skipped?: boolean; error?: string };

function authHeader(key: string) {
  return `Basic ${Buffer.from(`${key}:`).toString("base64")}`;
}

export async function createPaymentInvoice({
  amountSar,
  description,
  scheduleId,
  callbackUrl,
}: {
  amountSar: number;
  description: string;
  scheduleId: string;
  callbackUrl: string;
}): Promise<InvoiceResult> {
  const key = process.env.MOYASAR_SECRET_KEY;
  if (!key) return { skipped: true };

  try {
    const res = await fetch("https://api.moyasar.com/v1/invoices", {
      method: "POST",
      headers: {
        Authorization: authHeader(key),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: Math.round(amountSar * 100), // بالهللات
        currency: "SAR",
        description,
        callback_url: callbackUrl,
        metadata: { schedule_id: scheduleId },
      }),
    });
    if (!res.ok) return { error: `status ${res.status}` };
    const data = (await res.json()) as { url?: string };
    return { url: data.url };
  } catch {
    return { error: "network" };
  }
}

export type MoyasarPayment = {
  id: string;
  status: string;
  metadata?: { schedule_id?: string };
} | null;

export async function fetchPayment(id: string): Promise<MoyasarPayment> {
  const key = process.env.MOYASAR_SECRET_KEY;
  if (!key) return null;
  try {
    const res = await fetch(`https://api.moyasar.com/v1/payments/${id}`, {
      headers: { Authorization: authHeader(key) },
    });
    if (!res.ok) return null;
    return (await res.json()) as MoyasarPayment;
  } catch {
    return null;
  }
}
