# قاعدة بيانات إيوان (Supabase)

المخطط الكامل **مُطبَّق بالفعل** على مشروع الإنتاج في مومباي (`ap-south-1`):
35 جدولاً، عزل متعدد المؤسسات، نظام أدوار وصلاحيات (RBAC)، وسياسات RLS على كل جدول.

## مزامنة الترحيلات إلى المستودع (مرة واحدة)

```bash
# 1) سجّل الدخول واربط المشروع
npx supabase login
npx supabase link --project-ref thaeauvrwetgnxrbdsjh

# 2) اسحب المخطط الحالي كملفات ترحيل داخل supabase/migrations
npx supabase db pull

# 3) أعد توليد أنواع TypeScript بعد أي تعديل لاحق
pnpm db:types
```

## بعد ذلك
- أي تعديل جديد على المخطط: أنشئ ملف ترحيل عبر `npx supabase migration new <name>`، ثم `npx supabase db push`.
- بعد أي تغيير في الجداول، أعد توليد الأنواع: `pnpm db:types`.
