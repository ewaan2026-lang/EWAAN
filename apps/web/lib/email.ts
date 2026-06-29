// إرسال البريد عبر Resend — مُفعَّل بمتغيّري البيئة RESEND_API_KEY و EMAIL_FROM.
// إن لم يُضبطا، يعمل بلا أثر (skipped) حتى يُربط مزوّد البريد لاحقاً.
export type EmailResult = { ok: boolean; skipped?: boolean; error?: string };

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<EmailResult> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) return { ok: false, skipped: true };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html }),
    });
    if (!res.ok) return { ok: false, error: `status ${res.status}` };
    return { ok: true };
  } catch {
    return { ok: false, error: "network" };
  }
}
