interface Series {
  label: string;
  color: string;
  data: { x: string | number; y: number }[];
}

interface Props {
  series: Series[];
  height?: number;
  yMin?: number;
  yMax?: number;
  yLabel?: string;
}

export function TimeSeriesChart({ series, height = 220, yMin, yMax, yLabel }: Props) {
  const width = 720;
  const padL = 40;
  const padR = 16;
  const padT = 12;
  const padB = 28;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;

  const allY = series.flatMap(s => s.data.map(d => d.y));
  const minY = yMin ?? Math.min(...allY);
  const maxY = yMax ?? Math.max(...allY);
  const span = maxY - minY || 1;

  const labels = series[0]?.data.map(d => String(d.x)) || [];
  const xStep = innerW / Math.max(1, labels.length - 1);

  const yTicks = 4;

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[560px]">
        {Array.from({ length: yTicks + 1 }, (_, i) => {
          const y = padT + (innerH * i) / yTicks;
          const v = maxY - (span * i) / yTicks;
          return (
            <g key={i}>
              <line x1={padL} y1={y} x2={width - padR} y2={y} stroke="#30363d" />
              <text x={padL - 6} y={y} textAnchor="end" dominantBaseline="middle" fontSize={10} fill="#6e7681">
                {v.toFixed(2)}
              </text>
            </g>
          );
        })}
        {labels.map((l, i) => {
          if (labels.length > 12 && i % Math.ceil(labels.length / 12) !== 0) return null;
          const x = padL + i * xStep;
          return (
            <text key={i} x={x} y={height - 8} textAnchor="middle" fontSize={10} fill="#6e7681">
              {l}
            </text>
          );
        })}
        {series.map(s => {
          const path = s.data
            .map((d, i) => {
              const x = padL + i * xStep;
              const y = padT + (1 - (d.y - minY) / span) * innerH;
              return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
            })
            .join(' ');
          return <path key={s.label} d={path} fill="none" stroke={s.color} strokeWidth={2} />;
        })}
        {yLabel ? (
          <text x={8} y={padT - 2} fontSize={10} fill="#6e7681">
            {yLabel}
          </text>
        ) : null}
      </svg>
      <div className="mt-2 flex flex-wrap gap-3 px-2 text-xs text-tn-text-muted">
        {series.map(s => (
          <span key={s.label} className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2 w-3 rounded-sm" style={{ backgroundColor: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}
