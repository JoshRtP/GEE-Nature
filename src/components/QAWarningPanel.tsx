import { AlertTriangle, CheckCircle2, AlertOctagon, Info } from 'lucide-react';
import type { QAIssue } from '../types';

interface Props {
  issues: QAIssue[];
  onToggle?: (id: string, resolved: boolean) => void;
  compact?: boolean;
}

const SEVERITY_META = {
  info: { icon: Info, color: 'text-tn-text-muted', ring: 'ring-tn-border', bg: 'bg-tn-hover' },
  warning: { icon: AlertTriangle, color: 'text-yellow-400', ring: 'ring-yellow-500/30', bg: 'bg-yellow-500/10' },
  fail: { icon: AlertOctagon, color: 'text-red-400', ring: 'ring-red-500/30', bg: 'bg-red-500/10' },
};

export function QAWarningPanel({ issues, onToggle, compact = false }: Props) {
  if (!issues.length) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-tn-accent/30 bg-tn-accent/10 p-3 text-sm text-tn-accent">
        <CheckCircle2 className="h-4 w-4" /> No outstanding QA issues.
      </div>
    );
  }
  return (
    <ul className="space-y-2">
      {issues.map(i => {
        const meta = SEVERITY_META[i.severity];
        const Icon = meta.icon;
        return (
          <li
            key={i.id}
            className={`flex items-start gap-3 rounded-lg ${meta.bg} px-3 py-2.5 ring-1 ${meta.ring} ${i.resolved ? 'opacity-50' : ''}`}
          >
            <Icon className={`mt-0.5 h-4 w-4 flex-shrink-0 ${meta.color}`} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className={`font-semibold uppercase tracking-wide ${meta.color}`}>{i.severity}</span>
                <span className="rounded bg-tn-surface2 px-1.5 py-0.5 text-tn-text-muted ring-1 ring-tn-border">
                  {i.issue_type.replace('_', ' ')}
                </span>
                {i.resolved ? (
                  <span className="inline-flex items-center gap-1 rounded bg-tn-accent/15 px-1.5 py-0.5 text-tn-accent ring-1 ring-tn-accent/30">
                    <CheckCircle2 className="h-3 w-3" /> resolved
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-sm text-tn-text">{i.message}</p>
              {!compact ? (
                <p className="mt-0.5 text-xs text-tn-text-muted">
                  <span className="font-medium text-tn-text-muted">Action:</span> {i.recommended_action}
                </p>
              ) : null}
            </div>
            {onToggle && i.id ? (
              <button
                type="button"
                onClick={() => onToggle(i.id!, !i.resolved)}
                className="rounded-md border border-tn-border bg-tn-surface2 px-2 py-1 text-xs font-medium text-tn-text-muted hover:border-tn-accent/40 hover:text-tn-text transition-colors"
              >
                {i.resolved ? 'Reopen' : 'Resolve'}
              </button>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
