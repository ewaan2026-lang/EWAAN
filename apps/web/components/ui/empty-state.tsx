import type { ReactNode } from "react";

// حالة فارغة أنيقة: أيقونة + عنوان + وصف + إجراء.
export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon?: ReactNode;
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rise flex flex-col items-center justify-center rounded-3xl border border-dashed border-brand-teal/20 bg-white/60 px-6 py-16 text-center">
      {icon ? (
        <div className="float-slow mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-teal/10 text-brand-teal">
          {icon}
        </div>
      ) : null}
      <h3 className="text-lg font-bold text-brand-teal-900">{title}</h3>
      {body ? (
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-brand-teal-900/55">
          {body}
        </p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
