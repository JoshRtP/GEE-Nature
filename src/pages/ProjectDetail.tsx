import { useEffect, useMemo, useState } from 'react';
import {
  Activity, Droplets, Map, Network, Users, ShieldCheck, FileDown, Loader2,
} from 'lucide-react';
import {
  fetchProject, fetchProjectMetrics, fetchQAIssues, fetchMapLayers,
  updateQAIssueResolved,
} from '../services/projectService';
import type { Project, QAIssue, SpatialUnit } from '../types';
import { Tabs } from '../components/ui/Tabs';
import { OverviewTab } from './tabs/OverviewTab';
import { HabitatTab } from './tabs/HabitatTab';
import { WaterTab } from './tabs/WaterTab';
import { ConnectivityTab } from './tabs/ConnectivityTab';
import { CommunityTab } from './tabs/CommunityTab';
import { QATab } from './tabs/QATab';
import { ExportTab } from './tabs/ExportTab';
import { ScoreBadge } from '../components/ui/ScoreBadge';
import { GEEStatusProvider } from '../lib/useEarthEngine';

interface Props {
  projectId: string;
  onTitle: (title: string) => void;
}

const TABS = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'habitat', label: 'Habitat', icon: Map },
  { id: 'water', label: 'Water & Resilience', icon: Droplets },
  { id: 'connectivity', label: 'Connectivity', icon: Network },
  { id: 'community', label: 'Community & Livelihood', icon: Users },
  { id: 'qa', label: 'QA / QC', icon: ShieldCheck },
  { id: 'export', label: 'Export', icon: FileDown },
];

export function ProjectDetail({ projectId, onTitle }: Props) {
  const [project, setProject] = useState<Project | null>(null);
  const [units, setUnits] = useState<SpatialUnit[]>([]);
  const [issues, setIssues] = useState<QAIssue[]>([]);
  const [layers, setLayers] = useState<{ id: string; label: string; enabled: boolean }[]>([]);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      fetchProject(projectId),
      fetchProjectMetrics(projectId),
      fetchQAIssues(projectId),
      fetchMapLayers(projectId),
    ]).then(([p, u, q, l]) => {
      if (cancelled) return;
      setProject(p);
      setUnits(u);
      setIssues(q);
      setLayers(l);
      if (p) onTitle(p.name);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [projectId, onTitle]);

  const onToggleIssue = async (id: string, resolved: boolean) => {
    setIssues(prev => prev.map(i => (i.id === id ? { ...i, resolved } : i)));
    try { await updateQAIssueResolved(id, resolved); } catch { /* ignore */ }
  };

  const tabsList = useMemo(() => TABS.map(t => ({ id: t.id, label: t.label })), []);

  if (loading || !project) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-tn-border bg-tn-surface p-8 text-sm text-tn-text-muted">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading project…
      </div>
    );
  }

  return (
    <GEEStatusProvider projectId={projectId}>
    <div className="space-y-6 animate-fadeIn">
      <header className="rounded-xl border border-tn-border bg-tn-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-tn-text-subtle">
              <span>{project.country}</span>
              <span className="text-tn-border">·</span>
              <span>{project.ecosystem_type}</span>
              <span className="text-tn-border">·</span>
              <span className="capitalize">{project.status}</span>
            </div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-tn-text">{project.name}</h1>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {project.alignment.map(a => (
                <span key={a} className="rounded-full border border-tn-accent/30 bg-tn-accent/10 px-2 py-0.5 text-[11px] font-medium text-tn-accent">
                  {a.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-tn-text-subtle">Overall co-benefit</div>
            <div className="mt-1"><ScoreBadge score={project.overall_cobenefit_score} /></div>
            <div className="mt-2 text-xs text-tn-text-muted">{units.length} spatial units · {issues.filter(i => !i.resolved).length} open QA</div>
          </div>
        </div>
      </header>

      <Tabs tabs={tabsList} active={tab} onChange={setTab} />

      <div>
        {tab === 'overview' ? <OverviewTab project={project} units={units} issues={issues} layers={layers} /> : null}
        {tab === 'habitat' ? <HabitatTab project={project} units={units} layers={layers} /> : null}
        {tab === 'water' ? <WaterTab project={project} units={units} layers={layers} /> : null}
        {tab === 'connectivity' ? <ConnectivityTab units={units} layers={layers} /> : null}
        {tab === 'community' ? <CommunityTab project={project} /> : null}
        {tab === 'qa' ? <QATab issues={issues} onToggle={onToggleIssue} /> : null}
        {tab === 'export' ? <ExportTab project={project} units={units} issues={issues} /> : null}
      </div>
    </div>
    </GEEStatusProvider>
  );
}
