interface Bar {
  label: string;
  value: number;
  color?: string;
}

interface Props {
  bars: Bar[];
  height?: number;
  yLabel?: string;
}

export function BarChart({ bars, height = 220, yLabel }: Props) {
  const width = 640;
  const padL = 36;
  const padR = 12;
  const padT = 12;
  const padB = 36;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;

  const max = Math.max(...bars.map(b => b.value), 1);
  const barW = innerW / bars.length - 8;

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[480px]">
        {[0, 0.25, 0.5, 0.75, 1].map((f, i) => {
          const y = padT + innerH * (1 - f);
          return (
            <g key={i}>
              <line x1={padL} y1={y} x2={width - padR} y2={y} stroke="#30363d" />
              <text x={padL - 6} y={y} textAnchor="end" dominantBaseline="middle" fontSize={10} fill="#6e7681">
                {(max * f).toFixed(0)}
              </text>
            </g>
          );
        })}
        {bars.map((b, i) => {
          const h = (b.value / max) * innerH;
          const x = padL + i * (innerW / bars.length) + 4;
          const y = padT + innerH - h;
          return (
            <g key={b.label}>
              <rect x={x} y={y} width={barW} height={h} rx={3} fill={b.color || '#238636'} />
              <text x={x + barW / 2} y={height - 16} textAnchor="middle" fontSize={10} fill="#8b949e">
                {b.label}
              </text>
            </g>
          );
        })}
        {yLabel ? (
          <text x={8} y={padT - 2} fontSize={10} fill="#6e7681">
            {yLabel}
          </text>
        ) : null}
      </svg>
    </div>
  );
}
