import { useMemo, useState } from 'react';
import type { QAIssue } from '../../types';
import { Section } from '../../components/ui/Section';
import { QAWarningPanel } from '../../components/QAWarningPanel';

interface Props {
  issues: QAIssue[];
  onToggle: (id: string, resolved: boolean) => Promise<void>;
}

const TYPES: QAIssue['issue_type'][] = ['geometry', 'imagery', 'dataset', 'metric', 'report', 'claim_language', 'user_input'];
const SEVERITIES: ('all' | 'pass' | 'warning' | 'fail')[] = ['all', 'pass', 'warning', 'fail'];

export function QATab({ issues, onToggle }: Props) {
  const [sev, setSev] = useState<'all' | 'pass' | 'warning' | 'fail'>('all');

  const filtered = useMemo(() => {
    if (sev === 'all') return issues;
    if (sev === 'pass') return issues.filter(i => i.resolved);
    return issues.filter(i => i.severity === sev && !i.resolved);
  }, [issues, sev]);

  const grouped = useMemo(() => {
    const m = new Map<QAIssue['issue_type'], QAIssue[]>();
    for (const t of TYPES) m.set(t, []);
    for (const i of filtered) m.get(i.issue_type)?.push(i);
    return m;
  }, [filtered]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-tn-text-subtle">Filter</span>
        {SEVERITIES.map(s => (
          <button
            key={s}
            type="button"
            onClick={() => setSev(s)}
            className={`rounded-full px-3 py-1 text-xs font-medium ring-1 transition ${
              sev === s
                ? 'bg-tn-accent text-white ring-tn-accent'
                : 'bg-tn-surface text-tn-text-muted ring-tn-border hover:ring-tn-accent/40'
            }`}
          >
            {s}
          </button>
        ))}
        <span className="ml-auto text-xs text-tn-text-subtle">{filtered.length} of {issues.length} issues</span>
      </div>

      {TYPES.map(t => {
        const group = grouped.get(t) || [];
        if (!group.length) return null;
        return (
          <Section key={t} title={titleCase(t)} description={`${group.length} ${group.length === 1 ? 'issue' : 'issues'}`}>
            <QAWarningPanel issues={group} onToggle={onToggle} />
          </Section>
        );
      })}

      {!filtered.length ? (
        <div className="rounded-xl border border-tn-border bg-tn-surface p-8 text-center text-sm text-tn-text-muted">
          No QA issues match the current filter.
        </div>
      ) : null}
    </div>
  );
}

function titleCase(s: string) {
  return s.split('_').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
}
