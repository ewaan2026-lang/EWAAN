// مخطط دائري (donut) بـ SVG خالص — بلا أي مكتبة خارجية.
export type DonutSegment = { value: number; color: string };

export function DonutChart({
  segments,
  size = 168,
  thickness = 20,
  centerValue,
  centerLabel,
}: {
  segments: DonutSegment[];
  size?: number;
  thickness?: number;
  centerValue?: string;
  centerLabel?: string;
}) {
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const total = Math.max(
    1,
    segments.reduce((a, s) => a + s.value, 0),
  );

  let acc = 0;
  const arcs = segments
    .filter((s) => s.value > 0)
    .map((s, i) => {
      const len = (s.value / total) * c;
      const offset = c - acc;
      acc += len;
      return (
        <circle
          key={i}
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={s.color}
          strokeWidth={thickness}
          strokeDasharray={`${len} ${c - len}`}
          strokeDashoffset={offset}
          strokeLinecap="butt"
        />
      );
    });

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(0,128,157,0.10)"
          strokeWidth={thickness}
        />
        {arcs}
      </svg>
      {centerValue ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold text-brand-teal-900" dir="ltr">
            {centerValue}
          </span>
          {centerLabel ? (
            <span className="mt-0.5 text-xs font-medium text-brand-teal-900/50">{centerLabel}</span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
