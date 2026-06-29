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
  PencilIcon,
  LayersIcon,
  UsersIcon,
} from "@/components/ui/icons";

export type TenantItem = {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  leaseCount: number;
  activeLeases: number;
};

type Sort = "name" | "leases";
type FilterKey = "all" | "active" | "none";
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

export function TenantsExplorer({
  tenants,
  locale,
}: {
  tenants: TenantItem[];
  locale: string;
}) {
  const t = useTranslations("tenants");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("name");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [view, setView] = useState<View>("grid");

  const totalLeases = tenants.reduce((a, x) => a + x.leaseCount, 0);
  const totalActive = tenants.reduce((a, x) => a + x.activeLeases, 0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = tenants.filter((x) => {
      if (filter === "active" && x.activeLeases === 0) return false;
      if (filter === "none" && x.leaseCount > 0) return false;
      if (!q) return true;
      return (
        x.full_name.toLowerCase().includes(q) ||
        (x.phone ?? "").toLowerCase().includes(q) ||
        (x.email ?? "").toLowerCase().includes(q)
      );
    });
    list = [...list].sort((a, b) => {
      if (sort === "leases") return b.leaseCount - a.leaseCount;
      return a.full_name.localeCompare(b.full_name, locale === "ar" ? "ar" : "en");
    });
    return list;
  }, [tenants, query, filter, sort, locale]);

  const filters: { key: FilterKey; label: string }[] = [
    { key: "all", label: t("filterAll") },
    { key: "active", label: t("filterActive") },
    { key: "none", label: t("filterNoLease") },
  ];

  return (
    <div>
      <div className="mb-5 grid grid-cols-3 gap-3">
        <Stat icon={<UsersIcon className="h-5 w-5" />} label={t("statsTenants")} value={String(tenants.length)} />
        <Stat icon={<LayersIcon className="h-5 w-5" />} label={t("statsLeases")} value={String(totalLeases)} />
        <Stat icon={<LayersIcon className="h-5 w-5" />} label={t("statsActive")} value={String(totalActive)} />
      </div>

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
          <option value="leases">{t("sortMostLeases")}</option>
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
          {filtered.map((x) => (
            <TenantGridCard key={x.id} x={x} t={t} />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-brand-teal/10 bg-white shadow-card">
          {filtered.map((x, i) => (
            <TenantListRow key={x.id} x={x} t={t} first={i === 0} />
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

function QuickActions({ x, t }: { x: TenantItem; t: TFn }) {
  const wa = x.phone ? `https://wa.me/${waNumber(x.phone)}` : null;
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
      {x.phone ? (
        <a
          href={`tel:${x.phone}`}
          aria-label={t("actionCall")}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-teal-900/45 transition hover:bg-brand-teal/10 hover:text-brand-teal-900"
        >
          <PhoneIcon className="h-[17px] w-[17px]" />
        </a>
      ) : null}
      {x.email ? (
        <a
          href={`mailto:${x.email}`}
          aria-label={t("actionEmail")}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-teal-900/45 transition hover:bg-brand-teal/10 hover:text-brand-teal-900"
        >
          <MailIcon className="h-[17px] w-[17px]" />
        </a>
      ) : null}
      <Link
        href={`/tenants/${x.id}/edit`}
        aria-label="edit"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-teal-900/45 transition hover:bg-brand-teal/10 hover:text-brand-teal-900"
      >
        <PencilIcon className="h-[17px] w-[17px]" />
      </Link>
    </div>
  );
}

function TenantGridCard({ x, t }: { x: TenantItem; t: TFn }) {
  return (
    <div className="flex flex-col rounded-2xl border border-brand-teal/10 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:border-brand-teal/25 hover:shadow-lg">
      <div className="flex items-start gap-3.5">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-brass to-brand-teal text-base font-extrabold text-white" dir="ltr">
          {initials(x.full_name)}
        </span>
        <div className="min-w-0 flex-1">
          <Link
            href={`/tenants/${x.id}`}
            className="block truncate text-[15px] font-bold text-brand-teal-900 hover:text-brand-teal"
          >
            {x.full_name}
          </Link>
          <div className="mt-1 space-y-0.5">
            {x.phone ? (
              <p className="truncate text-xs text-brand-teal-900/55" dir="ltr">{x.phone}</p>
            ) : null}
            {x.email ? (
              <p className="truncate text-xs text-brand-teal-900/45" dir="ltr">{x.email}</p>
            ) : null}
          </div>
        </div>
        {x.activeLeases > 0 ? (
          <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
            {t("filterActive")}
          </span>
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-brand-teal/8 pt-3.5">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-brand-teal-900/55">
          <LayersIcon className="h-4 w-4" />
          {t("leasesCount", { count: x.leaseCount })}
        </span>
        <QuickActions x={x} t={t} />
      </div>
    </div>
  );
}

function TenantListRow({ x, t, first }: { x: TenantItem; t: TFn; first: boolean }) {
  return (
    <div
      className={`flex flex-wrap items-center gap-3 px-5 py-3.5 transition hover:bg-brand-teal/[0.03] ${
        first ? "" : "border-t border-brand-teal/8"
      }`}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-brass to-brand-teal text-xs font-extrabold text-white" dir="ltr">
        {initials(x.full_name)}
      </span>
      <div className="min-w-0 flex-1">
        <Link href={`/tenants/${x.id}`} className="truncate text-sm font-bold text-brand-teal-900 hover:text-brand-teal">
          {x.full_name}
        </Link>
        <p className="truncate text-xs text-brand-teal-900/45" dir="ltr">
          {x.phone ?? x.email ?? "—"}
        </p>
      </div>
      <span className="hidden items-center gap-1.5 text-xs font-semibold text-brand-teal-900/55 sm:flex">
        <LayersIcon className="h-4 w-4" />
        {x.leaseCount}
      </span>
      <QuickActions x={x} t={t} />
    </div>
  );
}
