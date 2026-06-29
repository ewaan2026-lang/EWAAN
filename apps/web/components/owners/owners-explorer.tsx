"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  SearchIcon,
  GridIcon,
  ListIcon,
  PhoneIcon,
  MailIcon,
  WhatsAppIcon,
  ChartIcon,
  PencilIcon,
  BuildingIcon,
  UsersIcon,
  KeyIcon,
} from "@/components/ui/icons";

export type OwnerItem = {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  commission_rate: number | null;
  propertyCount: number;
};

type Sort = "name" | "properties" | "fee";
type FilterKey = "all" | "with" | "without";
type View = "grid" | "list";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return (parts.map((p) => p[0]).join("") || "?").toUpperCase();
}

function waNumber(phone: string) {
  let d = phone.replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("0") && d.length === 10) d = "966" + d.slice(1);
  return d;
}

export function OwnersExplorer({
  owners,
  locale,
}: {
  owners: OwnerItem[];
  locale: string;
}) {
  const t = useTranslations("owners");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("name");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [view, setView] = useState<View>("grid");

  const totalProps = owners.reduce((a, o) => a + o.propertyCount, 0);
  const withFee = owners.filter((o) => o.commission_rate != null);
  const avgFee =
    withFee.length > 0
      ? Math.round(
          (withFee.reduce((a, o) => a + (o.commission_rate ?? 0), 0) / withFee.length) * 10,
        ) / 10
      : 0;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = owners.filter((o) => {
      if (filter === "with" && o.propertyCount === 0) return false;
      if (filter === "without" && o.propertyCount > 0) return false;
      if (!q) return true;
      return (
        o.full_name.toLowerCase().includes(q) ||
        (o.phone ?? "").toLowerCase().includes(q) ||
        (o.email ?? "").toLowerCase().includes(q)
      );
    });
    list = [...list].sort((a, b) => {
      if (sort === "properties") return b.propertyCount - a.propertyCount;
      if (sort === "fee") return (b.commission_rate ?? 0) - (a.commission_rate ?? 0);
      return a.full_name.localeCompare(b.full_name, locale === "ar" ? "ar" : "en");
    });
    return list;
  }, [owners, query, filter, sort, locale]);

  const filters: { key: FilterKey; label: string }[] = [
    { key: "all", label: t("filterAll") },
    { key: "with", label: t("filterWithProps") },
    { key: "without", label: t("filterNoProps") },
  ];

  return (
    <div>
      {/* شريط الإحصاءات */}
      <div className="mb-5 grid grid-cols-3 gap-3">
        <Stat icon={<UsersIcon className="h-5 w-5" />} label={t("statsOwners")} value={String(owners.length)} />
        <Stat icon={<BuildingIcon className="h-5 w-5" />} label={t("statsProperties")} value={String(totalProps)} />
        <Stat icon={<KeyIcon className="h-5 w-5" />} label={t("statsAvgFee")} value={`${avgFee}%`} />
      </div>

      {/* شريط الأدوات */}
      <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-brand-teal/10 bg-white p-3 shadow-card sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-brand-teal-900/35">
            <SearchIcon className="h-[18px] w-[18px]" />
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("search")}
            className="w-full rounded-xl border border-brand-teal/15 bg-brand-cream/40 py-2.5 pe-3 ps-10 text-sm outline-none transition focus:border-brand-teal focus:bg-white focus:ring-2 focus:ring-brand-teal/15"
          />
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          className="rounded-xl border border-brand-teal/15 bg-white px-3 py-2.5 text-sm font-semibold text-brand-teal-900 outline-none transition focus:border-brand-teal"
        >
          <option value="name">{t("sortName")}</option>
          <option value="properties">{t("sortMostProperties")}</option>
          <option value="fee">{t("sortHighestFee")}</option>
        </select>

        <div className="flex items-center gap-1 rounded-xl border border-brand-teal/15 bg-white p-1">
          <ViewBtn active={view === "grid"} onClick={() => setView("grid")} aria="grid">
            <GridIcon className="h-[18px] w-[18px]" />
          </ViewBtn>
          <ViewBtn active={view === "list"} onClick={() => setView("list")} aria="list">
            <ListIcon className="h-[18px] w-[18px]" />
          </ViewBtn>
        </div>
      </div>

      {/* الفلاتر + العدد */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                filter === f.key
                  ? "bg-brand-teal text-white shadow-card"
                  : "bg-white text-brand-teal-900/60 ring-1 ring-inset ring-brand-teal/15 hover:bg-brand-teal/5"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <span className="text-xs font-semibold text-brand-teal-900/45">
          {t("results", { count: filtered.length })}
        </span>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-brand-teal/20 bg-white/60 px-5 py-12 text-center text-sm text-brand-teal-900/55">
          {t("noResults")}
        </p>
      ) : view === "grid" ? (
        <div className="stagger grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((o) => (
            <OwnerGridCard key={o.id} o={o} t={t} />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-brand-teal/10 bg-white shadow-card">
          {filtered.map((o, i) => (
            <OwnerListRow key={o.id} o={o} t={t} first={i === 0} />
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-brand-teal/10 bg-white p-4 shadow-card">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-teal/10 text-brand-teal">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-lg font-extrabold text-brand-teal-900">{value}</p>
        <p className="truncate text-[11px] font-medium text-brand-teal-900/50">{label}</p>
      </div>
    </div>
  );
}

function ViewBtn({
  active,
  onClick,
  aria,
  children,
}: {
  active: boolean;
  onClick: () => void;
  aria: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={aria}
      className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
        active ? "bg-brand-teal text-white" : "text-brand-teal-900/45 hover:bg-brand-teal/5"
      }`}
    >
      {children}
    </button>
  );
}

type TFn = ReturnType<typeof useTranslations>;

function QuickActions({ o, t }: { o: OwnerItem; t: TFn }) {
  const wa = o.phone ? `https://wa.me/${waNumber(o.phone)}` : null;
  return (
    <div className="flex items-center gap-1">
      {wa ? (
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t("actionWhatsapp")}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition hover:bg-emerald-500 hover:text-white"
        >
          <WhatsAppIcon className="h-[17px] w-[17px]" />
        </a>
      ) : null}
      {o.phone ? (
        <a
          href={`tel:${o.phone}`}
          aria-label={t("actionCall")}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-teal-900/45 transition hover:bg-brand-teal/10 hover:text-brand-teal-900"
        >
          <PhoneIcon className="h-[17px] w-[17px]" />
        </a>
      ) : null}
      {o.email ? (
        <a
          href={`mailto:${o.email}`}
          aria-label={t("actionEmail")}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-teal-900/45 transition hover:bg-brand-teal/10 hover:text-brand-teal-900"
        >
          <MailIcon className="h-[17px] w-[17px]" />
        </a>
      ) : null}
      <Link
        href={`/owners/${o.id}/statement`}
        aria-label={t("viewStatement")}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-teal-900/45 transition hover:bg-brand-teal/10 hover:text-brand-teal-900"
      >
        <ChartIcon className="h-[17px] w-[17px]" />
      </Link>
      <Link
        href={`/owners/${o.id}/edit`}
        aria-label="edit"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-teal-900/45 transition hover:bg-brand-teal/10 hover:text-brand-teal-900"
      >
        <PencilIcon className="h-[17px] w-[17px]" />
      </Link>
    </div>
  );
}

function OwnerGridCard({ o, t }: { o: OwnerItem; t: TFn }) {
  return (
    <div className="flex flex-col rounded-2xl border border-brand-teal/10 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:border-brand-teal/25 hover:shadow-lg">
      <div className="flex items-start gap-3.5">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-teal to-brand-teal-900 text-base font-extrabold text-white" dir="ltr">
          {initials(o.full_name)}
        </span>
        <div className="min-w-0 flex-1">
          <Link
            href={`/owners/${o.id}`}
            className="block truncate text-[15px] font-bold text-brand-teal-900 hover:text-brand-teal"
          >
            {o.full_name}
          </Link>
          <div className="mt-1 space-y-0.5">
            {o.phone ? (
              <p className="truncate text-xs text-brand-teal-900/55" dir="ltr">{o.phone}</p>
            ) : null}
            {o.email ? (
              <p className="truncate text-xs text-brand-teal-900/45" dir="ltr">{o.email}</p>
            ) : null}
          </div>
        </div>
        {o.commission_rate != null ? (
          <span className="shrink-0 rounded-full bg-brand-teal/10 px-2.5 py-1 text-xs font-bold text-brand-teal-900">
            {o.commission_rate}%
          </span>
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-brand-teal/8 pt-3.5">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-brand-teal-900/55">
          <BuildingIcon className="h-4 w-4" />
          {t("propertiesCount", { count: o.propertyCount })}
        </span>
        <QuickActions o={o} t={t} />
      </div>
    </div>
  );
}

function OwnerListRow({ o, t, first }: { o: OwnerItem; t: TFn; first: boolean }) {
  return (
    <div
      className={`flex flex-wrap items-center gap-3 px-5 py-3.5 transition hover:bg-brand-teal/[0.03] ${
        first ? "" : "border-t border-brand-teal/8"
      }`}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-teal to-brand-teal-900 text-xs font-extrabold text-white" dir="ltr">
        {initials(o.full_name)}
      </span>
      <div className="min-w-0 flex-1">
        <Link href={`/owners/${o.id}`} className="truncate text-sm font-bold text-brand-teal-900 hover:text-brand-teal">
          {o.full_name}
        </Link>
        <p className="truncate text-xs text-brand-teal-900/45" dir="ltr">
          {o.phone ?? o.email ?? "—"}
        </p>
      </div>
      <span className="hidden items-center gap-1.5 text-xs font-semibold text-brand-teal-900/55 sm:flex">
        <BuildingIcon className="h-4 w-4" />
        {o.propertyCount}
      </span>
      {o.commission_rate != null ? (
        <span className="hidden rounded-full bg-brand-teal/10 px-2.5 py-1 text-xs font-bold text-brand-teal-900 sm:inline">
          {o.commission_rate}%
        </span>
      ) : null}
      <QuickActions o={o} t={t} />
    </div>
  );
}
