export function StatCard({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-brand-teal/10 bg-white p-5 shadow-card">
      <p className="text-sm text-brand-teal-900/60">{label}</p>
      <p
        className={`mt-2 text-3xl font-extrabold ${
          accent ? "text-brand-brass" : "text-brand-teal-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
