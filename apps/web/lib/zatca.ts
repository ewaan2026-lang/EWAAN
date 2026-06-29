// توليد حمولة رمز QR الخاص بهيئة الزكاة والضريبة (ZATCA - المرحلة الأولى).
// ترميز TLV (Tag-Length-Value) ثم Base64. لا يحتاج أي اتصال خارجي.

function tlv(tag: number, value: string): Buffer {
  const val = Buffer.from(value, "utf8");
  const len = Buffer.from([tag, val.length]);
  return Buffer.concat([len, val]);
}

export type ZatcaFields = {
  sellerName: string; // اسم البائع
  vatNumber: string; // الرقم الضريبي للبائع
  timestamp: string; // الطابع الزمني ISO 8601
  total: string; // الإجمالي شاملاً الضريبة
  vatTotal: string; // إجمالي ضريبة القيمة المضافة
};

// يعيد سلسلة Base64 تُوضع داخل رمز QR.
export function zatcaQrPayload(f: ZatcaFields): string {
  const buf = Buffer.concat([
    tlv(1, f.sellerName),
    tlv(2, f.vatNumber),
    tlv(3, f.timestamp),
    tlv(4, f.total),
    tlv(5, f.vatTotal),
  ]);
  return buf.toString("base64");
}
