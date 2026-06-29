import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { ArrowIcon } from "@/components/ui/icons";
import { PrintButton } from "@/components/invoices/print-button";

export const dynamic = "force-dynamic";

const FREQ: Record<string, string> = {
  monthly: "شهري",
  quarterly: "ربع سنوي",
  semi_annual: "نصف سنوي",
  annual: "سنوي",
};

const PTYPE: Record<string, string> = {
  residential_building: "عمارة سكنية",
  villa: "فيلا",
  floor: "دور",
  studio: "استوديو",
  apartment: "شقة",
  compound: "مجمّع",
  tower: "برج",
  other: "أخرى",
};

function sar(n: number) {
  return new Intl.NumberFormat("ar-SA-u-nu-latn", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default async function LeaseContractPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("leases");

  const supabase = await createClient();
  const { data: lease } = await supabase
    .from("leases")
    .select(
      "id, contract_number, rent_amount, payment_frequency, deposit_amount, late_fee_type, late_fee_value, grace_period_days, auto_renew, start_date, end_date, unit_id, tenant_id, organization_id",
    )
    .eq("id", id)
    .maybeSingle();
  if (!lease) notFound();

  const [{ data: tenant }, { data: unit }, { data: org }, { data: schedules }] =
    await Promise.all([
      supabase
        .from("tenants")
        .select("full_name, national_id, phone")
        .eq("id", lease.tenant_id)
        .maybeSingle(),
      supabase
        .from("units")
        .select("unit_number, area_sqm, property_id")
        .eq("id", lease.unit_id)
        .maybeSingle(),
      supabase
        .from("organizations")
        .select("name, legal_name, cr_number, vat_number, phone")
        .eq("id", lease.organization_id)
        .maybeSingle(),
      supabase
        .from("payment_schedules")
        .select("sequence, due_date, amount")
        .eq("lease_id", lease.id)
        .order("sequence", { ascending: true }),
    ]);

  type PropRow = {
    name: string;
    property_type: string;
    address: {
      city?: string | null;
      district?: string | null;
      street?: string | null;
      building_number?: string | null;
    } | null;
    national_address: string | null;
    owner_id: string | null;
  };
  type OwnerRow = {
    full_name: string;
    national_id: string | null;
    phone: string | null;
    iban: string | null;
  };

  let property: PropRow | null = null;
  if (unit?.property_id) {
    const { data } = await supabase
      .from("properties")
      .select("name, property_type, address, national_address, owner_id")
      .eq("id", unit.property_id)
      .maybeSingle();
    property = (data as PropRow | null) ?? null;
  }

  let owner: OwnerRow | null = null;
  if (property?.owner_id) {
    const { data } = await supabase
      .from("owners")
      .select("full_name, national_id, phone, iban")
      .eq("id", property.owner_id)
      .maybeSingle();
    owner = (data as OwnerRow | null) ?? null;
  }

  const addr = property?.address ?? null;
  const addressLine = [addr?.street, addr?.building_number, addr?.district, addr?.city]
    .filter(Boolean)
    .join("، ");
  const total = (schedules ?? []).reduce((a, s) => a + s.amount, 0);
  const landlordName = owner?.full_name || org?.legal_name || org?.name || "—";

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-5 flex items-center justify-between gap-3 no-print">
        <Link
          href={`/leases/${id}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-teal-900/60 transition hover:text-brand-teal-900"
        >
          <ArrowIcon className="h-4 w-4 rtl:rotate-180" />
          {t("title")}
        </Link>
        <PrintButton label={t("printContract")} />
      </div>

      <article
        dir="rtl"
        className="relative overflow-hidden rounded-2xl border border-brand-teal/10 bg-white p-8 text-brand-teal-900 shadow-luxe print:border-0 print:shadow-none sm:p-10"
      >
        <span className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-brand-gold via-brand-brass to-brand-gold print:hidden" />

        <header className="text-center">
          <h1 className="text-2xl font-extrabold">عقد إيجار</h1>
          <p className="mt-1 text-sm text-brand-teal-900/60">{landlordName}</p>
          <p className="mt-1 text-xs text-brand-teal-900/45" dir="ltr">
            {lease.contract_number ?? `#${lease.id.slice(0, 8)}`}
          </p>
          <p className="mx-auto mt-3 max-w-md rounded-lg bg-amber-50 px-3 py-1.5 text-[11px] font-semibold text-amber-700">
            نموذج متوافق مع هيكل عقد إيجار — مسودة غير رسمية، ويتم التوثيق النظامي عبر منصّة «إيجار».
          </p>
        </header>

        <Section n="1" title="أطراف العقد">
          <Party
            role="الطرف الأول (المؤجِّر)"
            name={landlordName}
            idNo={owner?.national_id ?? org?.cr_number ?? null}
            phone={owner?.phone ?? org?.phone ?? null}
            iban={owner?.iban ?? null}
          />
          <Party
            role="الطرف الثاني (المستأجِر)"
            name={tenant?.full_name ?? "—"}
            idNo={tenant?.national_id ?? null}
            phone={tenant?.phone ?? null}
          />
        </Section>

        <Section n="2" title="بيانات العقار المؤجَّر">
          <Row label="العقار" value={property?.name ?? "—"} />
          <Row label="نوع العقار" value={PTYPE[property?.property_type ?? "other"] ?? "—"} />
          <Row label="رقم الوحدة" value={unit?.unit_number ?? "—"} />
          <Row label="العنوان" value={addressLine || "—"} />
          <Row label="العنوان الوطني" value={property?.national_address ?? "—"} ltr />
          <Row label="المساحة" value={unit?.area_sqm ? `${unit.area_sqm} م²` : "—"} />
        </Section>

        <Section n="3" title="مدة العقد">
          <Row label="تاريخ البداية" value={lease.start_date ?? "—"} ltr />
          <Row label="تاريخ النهاية" value={lease.end_date ?? "—"} ltr />
          <Row label="التجديد التلقائي" value={lease.auto_renew ? "نعم" : "لا"} />
        </Section>

        <Section n="4" title="القيمة الإيجارية والدفعات">
          <Row label="القيمة الإيجارية" value={sar(lease.rent_amount)} ltr />
          <Row label="دورية الدفع" value={FREQ[lease.payment_frequency] ?? "—"} />
          {lease.deposit_amount ? (
            <Row label="مبلغ التأمين" value={sar(lease.deposit_amount)} ltr />
          ) : null}
          {lease.late_fee_value ? (
            <Row
              label="غرامة التأخير"
              value={`${lease.late_fee_value}${lease.late_fee_type === "percentage" ? "%" : " ر.س"}`}
              ltr
            />
          ) : null}

          {(schedules ?? []).length > 0 ? (
            <div className="mt-3 overflow-hidden rounded-lg border border-brand-teal/15">
              <div className="flex items-center justify-between bg-brand-teal/[0.06] px-3 py-1.5 text-xs font-bold text-brand-teal-900/70">
                <span>جدول الدفعات</span>
                <span>الإجمالي: <span dir="ltr">{sar(total)}</span></span>
              </div>
              {(schedules ?? []).map((s, i) => (
                <div
                  key={s.sequence}
                  className={`flex items-center justify-between px-3 py-1.5 text-xs ${
                    i > 0 ? "border-t border-brand-teal/8" : ""
                  }`}
                >
                  <span className="text-brand-teal-900/70">
                    دفعة <span dir="ltr">{s.sequence}</span> — <span dir="ltr">{s.due_date}</span>
                  </span>
                  <span className="font-bold" dir="ltr">
                    {sar(s.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </Section>

        <Section n="5" title="التزامات الطرفين">
          <Clauses
            items={[
              "يلتزم المؤجِّر بتسليم العين المؤجَّرة صالحة للاستعمال المتفق عليه.",
              "يلتزم المستأجِر بسداد القيمة الإيجارية في مواعيدها المحددة في جدول الدفعات.",
              "يلتزم المستأجِر باستخدام العين المؤجَّرة للغرض المتفق عليه والمحافظة عليها.",
              "لا يجوز للمستأجِر التأجير من الباطن أو التنازل عن العقد دون موافقة المؤجِّر الخطية.",
              "يتحمّل المستأجِر فواتير الخدمات (الكهرباء والماء ونحوها) ما لم يُتفق على غير ذلك.",
              "يلتزم الطرفان بأحكام نظام الإيجار واللوائح الصادرة عن الجهات المختصة.",
            ]}
          />
        </Section>

        <Section n="6" title="إنهاء العقد">
          <Clauses
            items={[
              "ينتهي العقد بانتهاء مدته ما لم يُجدَّد وفق الشروط المتفق عليها.",
              "يحق لأي طرف إنهاء العقد عند إخلال الطرف الآخر بالتزاماته الجوهرية بعد الإشعار.",
              "تُسوّى الخلافات ودياً، وإلا فعبر الجهات القضائية المختصة في المملكة العربية السعودية.",
            ]}
          />
        </Section>

        {/* التواقيع */}
        <div className="mt-8 grid grid-cols-2 gap-8">
          <Signature title="الطرف الأول (المؤجِّر)" name={landlordName} />
          <Signature title="الطرف الثاني (المستأجِر)" name={tenant?.full_name ?? "—"} />
        </div>
      </article>
    </div>
  );
}

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-7">
      <h2 className="mb-2.5 flex items-center gap-2 text-base font-bold text-brand-teal-900">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-teal/10 text-xs font-extrabold text-brand-teal" dir="ltr">
          {n}
        </span>
        {title}
      </h2>
      <div className="space-y-1.5 ps-8">{children}</div>
    </section>
  );
}

function Row({ label, value, ltr }: { label: string; value: string; ltr?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-brand-teal-900/55">{label}</span>
      <span className="text-end font-semibold text-brand-teal-900" dir={ltr ? "ltr" : undefined}>
        {value}
      </span>
    </div>
  );
}

function Party({
  role,
  name,
  idNo,
  phone,
  iban,
}: {
  role: string;
  name: string;
  idNo: string | null;
  phone: string | null;
  iban?: string | null;
}) {
  return (
    <div className="rounded-lg border border-brand-teal/10 bg-brand-teal/[0.03] p-3">
      <p className="mb-1.5 text-xs font-bold text-brand-teal">{role}</p>
      <Row label="الاسم" value={name} />
      <Row label="الهوية / السجل" value={idNo ?? "—"} ltr />
      <Row label="الجوال" value={phone ?? "—"} ltr />
      {iban ? <Row label="الآيبان" value={iban} ltr /> : null}
    </div>
  );
}

function Clauses({ items }: { items: string[] }) {
  return (
    <ol className="list-decimal space-y-1.5 ps-5 text-sm leading-relaxed text-brand-teal-900/80">
      {items.map((c, i) => (
        <li key={i}>{c}</li>
      ))}
    </ol>
  );
}

function Signature({ title, name }: { title: string; name: string }) {
  return (
    <div className="text-center">
      <p className="text-xs font-semibold text-brand-teal-900/55">{title}</p>
      <p className="mt-1 text-sm font-bold text-brand-teal-900">{name}</p>
      <div className="mt-10 border-t border-dashed border-brand-teal/30" />
      <p className="mt-1.5 text-[11px] text-brand-teal-900/45">التوقيع والتاريخ</p>
    </div>
  );
}
