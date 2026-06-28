import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";

// بطاقة إحصائية قابلة للنقر مع أيقونة.
export function StatLinkCard({
  label,
  value,
  icon,
  href,
  accent = false,
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
  href?: string;
  accent?: boolean;
}) {
  const inner = (
    <>
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
          accent ? "bg-brand-brass/15 text-brand-brass" : "bg-brand-teal/10 text-brand-teal"
        }`}
      >
        {icon}
      </span>
      <div className="mt-3">
        <p className={`text-2xl font-extrabold ${accent ? "text-brand-brass" : "text-brand-teal-900"}`}>
          {value}
        </p>
        <p className="mt-0.5 text-xs font-medium text-brand-teal-900/50">{label}</p>
      </div>
    </>
  );

  const cls =
    "flex flex-col rounded-2xl border border-brand-teal/10 bg-white p-4 shadow-card transition";

  if (href) {
    return (
      <Link href={href} className={`${cls} hover:-translate-y-0.5 hover:border-brand-teal/25 hover:shadow-lg`}>
        {inner}
      </Link>
    );
  }
  return <div className={cls}>{inner}</div>;
}
