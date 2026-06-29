// حلقة الإشغال — مؤشّر دائري ذهبي (يُعرض داخل الهيرو الداكن).
export function OccupancyRing({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value));
  const r = 34;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;

  return (
    <div className="relative flex h-[88px] w-[88px] items-center justify-center">
      <svg width="88" height="88" viewBox="0 0 88 88" className="-rotate-90">
        <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="8" />
        <circle
          cx="44"
          cy="44"
          r={r}
          fill="none"
          stroke="url(#goldgrad)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
        <defs>
          <linearGradient id="goldgrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFE9A8" />
            <stop offset="100%" stopColor="#D3AF37" />
          </linearGradient>
        </defs>
      </svg>
      <span className="absolute text-lg font-extrabold text-white" dir="ltr">
        {pct}%
      </span>
    </div>
  );
}
