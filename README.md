# إيوان — منصّة إدارة الأملاك والعقارات السكنية

منصّة سحابية لإدارة الأملاك السكنية للتأجير (السعودية)، ثنائية اللغة (عربي RTL / إنجليزي)،
مبنية بالكامل بـ TypeScript على Next.js + Supabase + Vercel.

## البنية (Monorepo / Turborepo)

```
apps/
  web/            تطبيق Next.js (App Router) — لوحة الإدارة + بوابة المستأجر
packages/
  db/             أنواع Supabase المولّدة + اختصارات الكيانات
  config/         إعدادات TypeScript المشتركة
supabase/
  migrations/     ترحيلات قاعدة البيانات (اسحبها عبر supabase db pull)
```

## التشغيل محلياً

```bash
pnpm install
cp .env.example apps/web/.env.local   # ثم عبّئ القيم
pnpm dev
```

افتح http://localhost:3000 (يُعاد توجيهك إلى /ar).

## متغيّرات البيئة

| المتغيّر | الوصف |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | رابط مشروع Supabase (علني) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | المفتاح العلني publishable (محمي بـ RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | سرّي — للخادم فقط (بدون بادئة NEXT_PUBLIC_) |
| `NEXT_PUBLIC_SITE_URL` | رابط الموقع لإعادة توجيه المصادقة |

## النشر على Vercel
- Root Directory: `apps/web`
- Framework: Next.js (يُكتشف تلقائياً)
- فعّل "Include files outside of the root directory" (لحِزم Monorepo)
- أضف متغيّرات البيئة أعلاه، ثم اربط المستودع → نشر تلقائي عند كل push.

## المصادقة
- يعمل تسجيل الدخول بالبريد/كلمة المرور فوراً.
- بعد أول دخول، إن لم تكن تنتمي لأي مؤسسة، ستظهر شاشة إنشاء المؤسسة (تستدعي RPC `create_organization`).
- اضبط Site URL و Redirect URLs في Supabase ← Authentication ← URL Configuration.

## الأمان
- عزل كامل بين المؤسسات عبر `organization_id` + RLS على كل جدول.
- نظام صلاحيات هجين (أدوار جاهزة + صلاحيات دقيقة).
- لا تُلصق الأسرار في الكود أو المستودع — استخدم متغيّرات البيئة فقط.
