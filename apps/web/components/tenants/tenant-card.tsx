import { Link } from "@/i18n/navigation";
import { PhoneIcon, MailIcon, IdIcon } from "@/components/ui/icons";

export type TenantCardData = {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  national_id: string | null;
};

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("");
}

export function TenantCard({ tenant }: { tenant: TenantCardData }) {
  const line = tenant.phone ?? tenant.email ?? tenant.national_id;
  const Icon = tenant.phone ? PhoneIcon : tenant.email ? MailIcon : IdIcon;

  return (
    <Link
      href={`/tenants/${tenant.id}`}
      className="group flex items-center gap-3.5 rounded-2xl border border-brand-teal/10 bg-white p-4 shadow-card transition hover:-translate-y-0.5 hover:border-brand-teal/25 hover:shadow-lg"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-brass to-brand-teal text-base font-extrabold text-white">
        {initials(tenant.full_name)}
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[15px] font-bold text-brand-teal-900">
          {tenant.full_name}
        </h3>
        {line ? (
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-brand-teal-900/55" dir="ltr">
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{line}</span>
          </p>
        ) : null}
      </div>
    </Link>
  );
}
