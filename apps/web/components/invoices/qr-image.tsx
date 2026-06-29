"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

// يرسم رمز QR من حمولة Base64 (ZATCA) على المتصفح.
export function QrImage({ value, size = 150 }: { value: string; size?: number }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    QRCode.toDataURL(value, { margin: 1, width: size, errorCorrectionLevel: "M" })
      .then(setSrc)
      .catch(() => {});
  }, [value, size]);

  if (!src) {
    return (
      <div
        className="animate-pulse rounded-lg bg-brand-teal/5"
        style={{ width: size, height: size }}
      />
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="ZATCA QR" width={size} height={size} className="rounded-lg" />;
}
