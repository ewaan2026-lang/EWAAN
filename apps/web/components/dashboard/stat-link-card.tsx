import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { CountUp } from "@/components/ui/count-up";

// بطاقة مؤشّر فاخرة: شريط ذهبي علوي + أيقونة + عدّاد متحرّك.
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
      <span className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-gold via-brand-brass to-brand-gold opacity-90" />
      <div className="flex items-center justify-between">
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 ${
            accent
              ? "bg-gradient-to-br from-brand-gold/25 to-brand-brass/20 text-brand-brass"
              : "bg-brand-teal/10 text-brand-teal"
          }`}
        >
          {icon}
        </span>
      </div>
      <div className="mt-4">
        <p
          className={`text-[28px] font-extrabold leading-none tabular-nums ${
            accent ? "text-brand-brass" : "text-brand-teal-900"
          }`}
        >
          <CountUp value={value} suffix={suffix} />
        </p>
        <p className="mt-1.5 text-xs font-semibold tracking-wide text-brand-teal-900/45">
          {label}
        </p>
      </div>
    </>
  );

  const cls =
    "group relative flex flex-col overflow-hidden rounded-2xl border border-brand-teal/10 bg-white p-5 shadow-card transition duration-300";

  if (href) {
    return (
      <Link
        href={href}
        className={`${cls} hover:-translate-y-1 hover:border-brand-brass/40 hover:shadow-luxe`}
      >
        {inner}
      </Link>
    );
  }
  return <div className={cls}>{inner}</div>;
}
