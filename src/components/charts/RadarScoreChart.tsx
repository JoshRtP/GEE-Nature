interface Axis {
  label: string;
  value: number; // 0-100
}

interface Props {
  axes: Axis[];
  size?: number;
}

export function RadarScoreChart({ axes, size = 280 }: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 36;
  const n = axes.length;
  const angle = (i: number) => -Math.PI / 2 + (i / n) * 2 * Math.PI;
  const point = (i: number, v: number) => {
    const a = angle(i);
    const rr = (v / 100) * r;
    return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr];
  };
  const ringPts = (frac: number) =>
    Array.from({ length: n }, (_, i) => {
      const a = angle(i);
      return `${cx + Math.cos(a) * r * frac},${cy + Math.sin(a) * r * frac}`;
    }).join(' ');

  const valuePoly = axes.map((a, i) => point(i, a.value).join(',')).join(' ');

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-sm">
      {[0.25, 0.5, 0.75, 1].map(f => (
        <polygon key={f} points={ringPts(f)} fill="none" stroke="#30363d" strokeWidth={1} />
      ))}
      {axes.map((_, i) => {
        const [x, y] = point(i, 100);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#30363d" />;
      })}
      <polygon points={valuePoly} fill="rgba(35,134,54,0.2)" stroke="#238636" strokeWidth={2} />
      {axes.map((a, i) => {
        const [x, y] = point(i, 100);
        const lx = cx + (x - cx) * 1.18;
        const ly = cy + (y - cy) * 1.18;
        return (
          <text key={a.label} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fill="#8b949e" fontSize={10}>
            {a.label}
          </text>
        );
      })}
      {axes.map((a, i) => {
        const [x, y] = point(i, a.value);
        return <circle key={i} cx={x} cy={y} r={3} fill="#238636" />;
      })}
    </svg>
  );
}
