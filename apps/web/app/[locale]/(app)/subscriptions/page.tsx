import { setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrgId } from "@/lib/org";
import { PageHeader } from "@/components/ui/page-header";
import { CheckIcon } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

type Plan = {
  tier: "basic" | "professional" | "enterprise";
  name: string;
  price: string;
  period: string;
  features: string[];
  featured?: boolean;
};

const COPY = {
  ar: {
    title: "الاشتراك والباقات",
    subtitle: "اختر الباقة المناسبة لحجم أعمالك العقارية",
    current: "باقتك الحالية",
    choose: "اختيار الباقة",
    contact: "تواصل معنا",
    perMonth: "/ شهرياً",
    free: "مجاني",
    custom: "حسب الطلب",
    note: "الأسعار استرشادية وقابلة للتخصيص. التفعيل والفوترة يُضبطان لاحقاً.",
    plans: [
      {
        tier: "basic" as const,
        name: "الأساسية",
        price: "free",
        features: [
          "حتى 10 عقارات",
          "إدارة الوحدات والعقود والمستأجرين",
          "جدول دفعات تلقائي",
          "تقارير أساسية",
        ],
      },
      {
        tier: "professional" as const,
        name: "الاحترافية",
        price: "299",
        featured: true,
        features: [
          "عقارات ووحدات غير محدودة",
          "فواتير ZATCA + رمز QR",
          "إشعارات ودفع إلكتروني",
          "الخرائط وإدارة المستندات",
          "كشوف الملّاك وعقود PDF",
        ],
      },
      {
        tier: "enterprise" as const,
        name: "المؤسسات",
        price: "custom",
        features: [
          "كل مزايا الاحترافية",
          "تعدّد المحافظ والفروع",
          "التكاملات الحكومية (نفاذ/إيجار)",
          "صلاحيات متقدمة ودعم مخصّص",
        ],
      },
    ],
  },
  en: {
    title: "Subscription & plans",
    subtitle: "Pick the plan that fits your real-estate business",
    current: "Your current plan",
    choose: "Choose plan",
    contact: "Contact us",
    perMonth: "/ month",
    free: "Free",
    custom: "Custom",
    note: "Prices are indicative and customizable. Activation and billing are configured later.",
    plans: [
      {
        tier: "basic" as const,
        name: "Basic",
        price: "free",
        features: [
          "Up to 10 properties",
          "Units, leases & tenants",
          "Automatic payment schedule",
          "Basic reports",
        ],
      },
      {
        tier: "professional" as const,
        name: "Professional",
        price: "299",
        featured: true,
        features: [
          "Unlimited properties & units",
          "ZATCA invoices + QR",
          "Notifications & online payment",
          "Maps & document management",
          "Owner statements & PDF contracts",
        ],
      },
      {
        tier: "enterprise" as const,
        name: "Enterprise",
        price: "custom",
        features: [
          "Everything in Professional",
          "Multiple portfolios & branches",
          "Government integrations (Nafath/Ejar)",
          "Advanced roles & dedicated support",
        ],
      },
    ],
  },
};

export default async function SubscriptionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const c = locale === "en" ? COPY.en : COPY.ar;

  const orgId = await getActiveOrgId();
  let currentTier = "basic";
  if (orgId) {
    const supabase = await createClient();
    const { data: org } = await supabase
      .from("organizations")
      .select("subscription_tier")
      .eq("id", orgId)
      .maybeSingle();
    currentTier = org?.subscription_tier ?? "basic";
  }

  const priceText = (p: Plan["price"]) =>
    p === "free" ? c.free : p === "custom" ? c.custom : p;

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title={c.title} subtitle={c.subtitle} />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {c.plans.map((plan) => {
          const isCurrent = plan.tier === currentTier;
          return (
            <div
              key={plan.tier}
              className={`relative flex flex-col overflow-hidden rounded-3xl border bg-white p-6 shadow-card transition hover:-translate-y-1 hover:shadow-luxe ${
                plan.featured ? "border-brand-brass/40 ring-1 ring-brand-gold/30" : "border-brand-teal/10"
              }`}
            >
              {plan.featured ? (
                <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-gold via-brand-brass to-brand-gold" />
              ) : null}

              <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg font-extrabold text-brand-teal-900">{plan.name}</h2>
                {isCurrent ? (
                  <span className="rounded-full bg-brand-teal/10 px-2.5 py-1 text-[11px] font-bold text-brand-teal">
                    {c.current}
                  </span>
                ) : null}
              </div>

              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-brand-teal-900" dir="ltr">
                  {priceText(plan.price)}
                </span>
                {plan.price !== "free" && plan.price !== "custom" ? (
                  <span className="text-sm text-brand-teal-900/45">{c.perMonth}</span>
                ) : null}
              </div>

              <ul className="mt-5 flex-1 space-y-2.5">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-brand-teal-900/75">
                    <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-teal" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                disabled={isCurrent}
                className={`mt-6 rounded-xl px-5 py-2.5 text-sm font-bold transition disabled:opacity-50 ${
                  plan.featured
                    ? "bg-brand-teal text-white hover:bg-brand-teal-700"
                    : "border border-brand-teal/20 bg-white text-brand-teal-900 hover:bg-brand-teal/5"
                }`}
              >
                {isCurrent ? c.current : plan.price === "custom" ? c.contact : c.choose}
              </button>
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-center text-xs text-brand-teal-900/45">{c.note}</p>
    </div>
  );
}
