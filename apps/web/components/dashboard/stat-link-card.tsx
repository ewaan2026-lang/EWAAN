import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { CountUp } from "@/components/ui/count-up";

// بطاقة إحصائية قابلة للنقر مع أيقونة وعدّاد متحرّك.
export function StatLinkCard({
  label,
  value,
  suffix = "",
  icon,
  href,
  accent = false,
}: {
  label: string;
  value: number;
  suffix?: string;
  icon: ReactNode;
  href?: string;
  accent?: boolean;
}) {
  const inner = (
    <>
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${
          accent ? "bg-brand-brass/15 text-brand-brass" : "bg-brand-teal/10 text-brand-teal"
        }`}
      >
        {icon}
      </span>
      <div className="mt-3">
        <p
          className={`text-2xl font-extrabold tabular-nums ${
            accent ? "text-brand-brass" : "text-brand-teal-900"
          }`}
        >
          <CountUp value={value} suffix={suffix} />
        </p>
        <p className="mt-0.5 text-xs font-medium text-brand-teal-900/50">{label}</p>
      </div>
    </>
  );

  const cls =
    "group flex flex-col rounded-2xl border border-brand-teal/10 bg-white p-4 shadow-card transition duration-300";

  if (href) {
    return (
      <Link
        href={href}
        className={`${cls} hover:-translate-y-1 hover:border-brand-teal/25 hover:shadow-lg`}
      >
        {inner}
      </Link>
    );
  }
  return <div className={cls}>{inner}</div>;
}
