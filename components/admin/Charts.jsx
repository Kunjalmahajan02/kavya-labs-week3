// Small dependency-free charts drawn with SVG and CSS

export function StatCard({ label, value, change, hint }) {
  const up = change > 0;
  return (
    <div className="min-w-0 rounded-2xl bg-white border border-slate-200 p-4 sm:p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl sm:text-3xl font-bold text-ink">{value}</p>
      {change !== undefined ? (
        <p className={`mt-1 text-xs font-medium ${up ? "text-emerald-600" : change < 0 ? "text-red-600" : "text-slate-500"}`}>
          {up ? "▲" : change < 0 ? "▼" : "•"} {Math.abs(change)}% vs previous 7 days
        </p>
      ) : (
        hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>
      )}
    </div>
  );
}

/** Daily bar chart. data: [{ key, label, count }] */
export function BarChart({ title, total, data, color = "#f97316" }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const w = 600;
  const h = 180;
  const gap = 4;
  const barW = (w - gap * (data.length - 1)) / data.length;

  return (
    <figure className="rounded-2xl bg-white border border-slate-200 p-5">
      <figcaption className="flex items-baseline justify-between gap-2">
        <span className="font-semibold text-ink">{title}</span>
        <span className="text-sm text-slate-500">{total} in 30 days</span>
      </figcaption>
      <svg viewBox={`0 0 ${w} ${h + 24}`} className="mt-4 w-full h-auto" role="img" aria-label={`${title}: ${total} in the last 30 days`}>
        {[0.5, 1].map((f) => (
          <line key={f} x1="0" x2={w} y1={h - h * f} y2={h - h * f} stroke="#e2e8f0" strokeDasharray="4 4" />
        ))}
        <line x1="0" x2={w} y1={h} y2={h} stroke="#cbd5e1" />
        {data.map((d, i) => {
          const barH = (d.count / max) * (h - 8);
          const x = i * (barW + gap);
          return (
            <g key={d.key}>
              <rect x={x} y={h - barH} width={barW} height={Math.max(barH, d.count ? 2 : 0)} rx="3" fill={color}>
                <title>{`${d.label}: ${d.count}`}</title>
              </rect>
              {(i % 5 === 0 || i === data.length - 1) && (
                <text x={x + barW / 2} y={h + 18} textAnchor="middle" fontSize="13" fill="#64748b">
                  {d.label}
                </text>
              )}
            </g>
          );
        })}
        <text x="0" y="12" fontSize="12" fill="#94a3b8">
          {max}
        </text>
      </svg>
    </figure>
  );
}

/** Horizontal share bars. items: [{ label, count }] */
export function Breakdown({ title, items, colors = ["#f97316", "#0b1020"] }) {
  const total = items.reduce((s, i) => s + i.count, 0) || 1;
  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-5">
      <p className="font-semibold text-ink">{title}</p>
      <div className="mt-4 flex h-3 rounded-full overflow-hidden bg-slate-100" aria-hidden="true">
        {items.map((item, i) => (
          <span key={item.label} style={{ width: `${(item.count / total) * 100}%`, background: colors[i % colors.length] }} />
        ))}
      </div>
      <ul className="mt-4 space-y-2 text-sm">
        {items.map((item, i) => (
          <li key={item.label} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: colors[i % colors.length] }} aria-hidden="true" />
            <span className="text-slate-600">{item.label}</span>
            <span className="ml-auto font-semibold text-ink">
              {item.count} <span className="text-slate-400 font-normal">({Math.round((item.count / total) * 100)}%)</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
