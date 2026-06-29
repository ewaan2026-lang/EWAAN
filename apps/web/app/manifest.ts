import type { MetadataRoute } from "next";

// بيان تطبيق الويب (PWA) — يجعل إيوان قابلاً للتثبيت على الهاتف.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "إيوان — إدارة الأملاك",
    short_name: "إيوان",
    description: "منصة متكاملة لإدارة الأملاك والعقارات",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#022730",
    theme_color: "#00809D",
    dir: "rtl",
    lang: "ar",
    categories: ["business", "productivity", "finance"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
