import createMiddleware from "next-intl/middleware";
import { type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { updateSession } from "./lib/supabase/middleware";

const handleI18n = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  // 1) توجيه اللغة (next-intl) ينتج الاستجابة الأساسية
  const response = handleI18n(request);
  // 2) تحديث جلسة Supabase وكتابة الكوكيز على نفس الاستجابة
  return updateSession(request, response);
}

export const config = {
  // طبّق على كل المسارات عدا الملفات الثابتة وملفات النظام
  matcher: ["/((?!api|auth|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
