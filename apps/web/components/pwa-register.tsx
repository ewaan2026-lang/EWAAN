"use client";

import { useEffect } from "react";

// تسجيل الـ Service Worker لتفعيل تثبيت التطبيق (PWA).
export function PwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* تجاهل بصمت */
      });
    }
  }, []);
  return null;
}
