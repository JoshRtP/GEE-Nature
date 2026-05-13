interface Props {
  score: number;
  size?: 'sm' | 'md';
  label?: string;
}

function classify(score: number): { label: string; className: string } {
  if (score >= 80) return { label: 'Very high', className: 'bg-tn-accent/15 text-tn-accent ring-tn-accent/30' };
  if (score >= 60) return { label: 'High', className: 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/30' };
  if (score >= 40) return { label: 'Moderate', className: 'bg-yellow-500/15 text-yellow-400 ring-yellow-500/30' };
  if (score >= 20) return { label: 'Low', className: 'bg-orange-500/15 text-orange-400 ring-orange-500/30' };
  return { label: 'Very low', className: 'bg-red-500/15 text-red-400 ring-red-500/30' };
}

export function ScoreBadge({ score, size = 'md', label }: Props) {
  const { label: cls, className } = classify(score);
  const sz = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full ring-1 ${className} ${sz} font-medium`}>
      <span className="font-semibold">{Math.round(score)}</span>
      <span className="opacity-50">·</span>
      <span>{label || cls}</span>
    </span>
  );
}
