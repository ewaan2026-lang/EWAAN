import type { ReactNode } from "react";

// ترويسة صفحة موحّدة: عنوان + وصف + إجراء على اليسار/اليمين (حسب الاتجاه).
export function PageHeader({
  title,
  subtitle,
  action,
  eyebrow,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  eyebrow?: ReactNode;
}) {
  return (
    <header className="rise mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? <div className="mb-2">{eyebrow}</div> : null}
        <h1 className="truncate text-2xl font-extrabold tracking-tight text-brand-teal-900 sm:text-[28px]">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-brand-teal-900/55">{subtitle}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}
