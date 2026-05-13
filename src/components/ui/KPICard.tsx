import type { LucideIcon } from 'lucide-react';

interface Props {
  label: string;
  value: string | number;
  unit?: string;
  delta?: number;
  icon?: LucideIcon;
  tone?: 'default' | 'good' | 'warn' | 'bad';
}

const TONE: Record<NonNullable<Props['tone']>, string> = {
  default: 'border-tn-border',
  good: 'border-tn-accent/40 bg-tn-accent/5',
  warn: 'border-yellow-600/40 bg-yellow-600/5',
  bad: 'border-red-600/40 bg-red-600/5',
};

export function KPICard({ label, value, unit, delta, icon: Icon, tone = 'default' }: Props) {
  const positive = typeof delta === 'number' && delta > 0;
  const negative = typeof delta === 'number' && delta < 0;
  return (
    <div className={`rounded-xl border ${TONE[tone]} bg-tn-surface p-4 transition hover:border-tn-accent/30`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-tn-text-subtle">{label}</span>
        {Icon ? <Icon className="h-4 w-4 text-tn-text-subtle" /> : null}
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-2xl font-semibold text-tn-text">{value}</span>
        {unit ? <span className="text-sm text-tn-text-muted">{unit}</span> : null}
      </div>
      {typeof delta === 'number' ? (
        <div className={`mt-1 text-xs font-medium ${positive ? 'text-tn-accent' : negative ? 'text-red-400' : 'text-tn-text-muted'}`}>
          {positive ? '+' : ''}
          {delta} vs baseline
        </div>
      ) : null}
    </div>
  );
}
