import { useEffect, useState } from 'react';
import { Plus, MapPin, Leaf, Calendar, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import { ensureSeedProjects, fetchProjects } from '../services/projectService';
import type { Project } from '../types';
import { ScoreBadge } from '../components/ui/ScoreBadge';

interface Props {
  onOpen: (id: string) => void;
  onNew: () => void;
}

const STATUS_TONE: Record<Project['status'], string> = {
  draft: 'bg-tn-hover text-tn-text-muted ring-tn-border',
  processing: 'bg-yellow-500/15 text-yellow-400 ring-yellow-500/30',
  processed: 'bg-sky-500/15 text-sky-400 ring-sky-500/30',
  reviewed: 'bg-tn-accent/15 text-tn-accent ring-tn-accent/30',
  exported: 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/30',
};

export function ProjectsPage({ onOpen, onNew }: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        await ensureSeedProjects();
        const list = await fetchProjects();
        setProjects(list);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-tn-text">Sustainability projects</h1>
          <p className="mt-1 text-sm text-tn-text-muted">
            Quantify biodiversity, resilience, water-risk, and livelihood-support indicators for land-based projects.
          </p>
        </div>
        <button
          type="button"
          onClick={onNew}
          className="inline-flex items-center gap-1.5 rounded-md bg-tn-accent px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-tn-accent-hover"
        >
          <Plus className="h-4 w-4" /> New project
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 rounded-xl border border-tn-border bg-tn-surface p-8 text-sm text-tn-text-muted">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading projects…
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map(p => (
            <button
              key={p.id}
              type="button"
              onClick={() => onOpen(p.id)}
              className="group flex flex-col rounded-xl border border-tn-border bg-tn-surface p-5 text-left transition hover:-translate-y-0.5 hover:border-tn-accent/40 hover:shadow-lg hover:shadow-black/20"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide ring-1 ${STATUS_TONE[p.status]}`}>
                  {p.status}
                </span>
                <ScoreBadge score={p.overall_cobenefit_score} size="sm" />
              </div>
              <h3 className="text-base font-semibold text-tn-text">{p.name}</h3>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-tn-text-muted">
                <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-tn-text-subtle" />{p.country}</span>
                <span className="inline-flex items-center gap-1"><Leaf className="h-3.5 w-3.5 text-tn-text-subtle" />{p.ecosystem_type}</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-tn-text-muted">
                <div className="rounded-md bg-tn-hover px-2 py-1.5">
                  <div className="text-[10px] font-semibold uppercase text-tn-text-subtle">Baseline</div>
                  <div className="mt-0.5 inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{fmtRange(p.baseline_start, p.baseline_end)}</div>
                </div>
                <div className="rounded-md bg-tn-hover px-2 py-1.5">
                  <div className="text-[10px] font-semibold uppercase text-tn-text-subtle">Monitoring</div>
                  <div className="mt-0.5 inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{fmtRange(p.monitoring_start, p.monitoring_end)}</div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1 text-yellow-400">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {p.qa_warning_count} QA warning{p.qa_warning_count === 1 ? '' : 's'}
                </span>
                <span className="inline-flex items-center gap-1 text-tn-accent group-hover:gap-1.5 transition-all">
                  Open dashboard <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function fmtRange(a: string | null, b: string | null) {
  if (!a || !b) return '—';
  return `${a.slice(0, 7)} → ${b.slice(0, 7)}`;
}
