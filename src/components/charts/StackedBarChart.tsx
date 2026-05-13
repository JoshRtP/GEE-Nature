interface Stack {
  label: string;
  segments: { name: string; value: number; color: string }[];
}

interface Props {
  data: Stack[];
  height?: number;
}

export function StackedBarChart({ data, height = 240 }: Props) {
  const totals = data.map(d => d.segments.reduce((s, x) => s + x.value, 0));
  const max = Math.max(...totals, 1);
  const width = 640;
  const padL = 40;
  const padR = 12;
  const padT = 12;
  const padB = 36;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;
  const barW = innerW / data.length - 12;
  const legend = Array.from(
    new Map(data.flatMap(d => d.segments.map(s => [s.name, s.color]))).entries()
  );

  return (
    <div>
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[480px]">
          {[0, 0.25, 0.5, 0.75, 1].map((f, i) => {
            const y = padT + innerH * (1 - f);
            return (
              <g key={i}>
                <line x1={padL} y1={y} x2={width - padR} y2={y} stroke="#30363d" />
                <text x={padL - 6} y={y} textAnchor="end" dominantBaseline="middle" fontSize={10} fill="#6e7681">
                  {Math.round(max * f)}
                </text>
              </g>
            );
          })}
          {data.map((stack, i) => {
            let acc = 0;
            const x = padL + i * (innerW / data.length) + 6;
            return (
              <g key={stack.label}>
                {stack.segments.map(seg => {
                  const h = (seg.value / max) * innerH;
                  const y = padT + innerH - acc - h;
                  acc += h;
                  return <rect key={seg.name} x={x} y={y} width={barW} height={h} fill={seg.color} />;
                })}
                <text x={x + barW / 2} y={height - 16} textAnchor="middle" fontSize={10} fill="#8b949e">
                  {stack.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="mt-2 flex flex-wrap gap-3 px-2 text-xs text-tn-text-muted">
        {legend.map(([name, color]) => (
          <span key={name} className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2 w-3 rounded-sm" style={{ backgroundColor: color }} />
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}
