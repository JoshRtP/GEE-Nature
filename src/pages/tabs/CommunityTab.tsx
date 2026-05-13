import { useEffect, useState } from 'react';
import { AlertTriangle, Save, Loader2 } from 'lucide-react';
import type { CommunityIndicator, Project } from '../../types';
import { fetchCommunityIndicator, updateCommunityIndicators } from '../../services/projectService';
import { Section } from '../../components/ui/Section';
import { ScoreBadge } from '../../components/ui/ScoreBadge';
import { NumField, TextField } from '../../components/ui/FormFields';

interface Props {
  project: Project;
}

const EMPTY: CommunityIndicator = {
  project_id: '',
  participating_households: 0,
  participating_farms: 0,
  hectares_enrolled: 0,
  payments_to_participants: 0,
  jobs_created: 0,
  training_events: 0,
  participants_trained: 0,
  grievances_received: 0,
  grievances_resolved: 0,
  stakeholder_consultation_events: 0,
  benefit_sharing_description: '',
  negative_impact_mitigation: '',
};

export function CommunityTab({ project }: Props) {
  const [data, setData] = useState<CommunityIndicator>({ ...EMPTY, project_id: project.id });
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    fetchCommunityIndicator(project.id).then(d => {
      if (d) setData(d);
      setLoaded(true);
    });
  }, [project.id]);

  const set = <K extends keyof CommunityIndicator>(k: K, v: CommunityIndicator[K]) =>
    setData(prev => ({ ...prev, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      await updateCommunityIndicators(project.id, data);
      setSavedAt(new Date().toLocaleTimeString());
    } finally {
      setSaving(false);
    }
  };

  const filledFields = [
    data.participating_households, data.participating_farms, data.hectares_enrolled,
    data.payments_to_participants, data.jobs_created, data.training_events,
    data.participants_trained, data.stakeholder_consultation_events,
  ].filter(v => Number(v) > 0).length;
  const completeness = Math.round((filledFields / 8) * 100);
  const evidenceScore = Math.round(project.livelihood_support_evidence_score);
  const grievanceRate =
    data.grievances_received > 0 ? data.grievances_resolved / data.grievances_received : null;

  if (!loaded) {
    return (
      <div className="flex items-center gap-2 text-sm text-tn-text-muted">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-300">
        <div className="flex items-start gap-2">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <p>
            Livelihood outcomes require project records and surveys. Satellite data alone cannot prove
            household income, food security, or community well-being. Use this form to capture
            project-entered evidence.
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-tn-border bg-tn-surface p-4">
          <div className="text-xs font-semibold uppercase text-tn-text-subtle">Livelihood support evidence</div>
          <div className="mt-2">
            <ScoreBadge score={evidenceScore} />
          </div>
        </div>
        <div className="rounded-xl border border-tn-border bg-tn-surface p-4">
          <div className="text-xs font-semibold uppercase text-tn-text-subtle">Data completeness</div>
          <div className="mt-2">
            <ScoreBadge score={completeness} label={`${completeness}% complete`} />
          </div>
        </div>
        <div className="rounded-xl border border-tn-border bg-tn-surface p-4">
          <div className="text-xs font-semibold uppercase text-tn-text-subtle">Grievance resolution</div>
          <div className="mt-2 text-2xl font-semibold text-tn-text">
            {grievanceRate === null ? '—' : `${Math.round(grievanceRate * 100)}%`}
          </div>
          <p className="mt-1 text-xs text-tn-text-muted">
            {data.grievances_resolved} of {data.grievances_received} resolved
          </p>
        </div>
      </div>

      <Section
        title="Participation and benefit-sharing"
        description="Enter project records for the current monitoring period."
        actions={
          <div className="flex items-center gap-3">
            {savedAt ? <span className="text-xs text-tn-text-subtle">Saved {savedAt}</span> : null}
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-md bg-tn-accent px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-tn-accent-hover disabled:opacity-60 transition-colors"
            >
              <Save className="h-3.5 w-3.5" />
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        }
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <NumField label="Participating households" v={data.participating_households} on={n => set('participating_households', n)} />
          <NumField label="Participating farms" v={data.participating_farms} on={n => set('participating_farms', n)} />
          <NumField label="Hectares enrolled" v={data.hectares_enrolled} on={n => set('hectares_enrolled', n)} />
          <NumField label="Payments to participants (EUR)" v={data.payments_to_participants} on={n => set('payments_to_participants', n)} />
          <NumField label="Jobs created" v={data.jobs_created} on={n => set('jobs_created', n)} />
          <NumField label="Training events" v={data.training_events} on={n => set('training_events', n)} />
          <NumField label="Participants trained" v={data.participants_trained} on={n => set('participants_trained', n)} />
          <NumField label="Stakeholder consultation events" v={data.stakeholder_consultation_events} on={n => set('stakeholder_consultation_events', n)} />
          <NumField label="Grievances received" v={data.grievances_received} on={n => set('grievances_received', n)} />
          <NumField label="Grievances resolved" v={data.grievances_resolved} on={n => set('grievances_resolved', n)} />
          <TextField
            className="md:col-span-2 lg:col-span-3"
            label="Benefit-sharing description"
            v={data.benefit_sharing_description}
            on={s => set('benefit_sharing_description', s)}
          />
          <TextField
            className="md:col-span-2 lg:col-span-3"
            label="Negative-impact mitigation actions"
            v={data.negative_impact_mitigation}
            on={s => set('negative_impact_mitigation', s)}
          />
        </div>
      </Section>
    </div>
  );
}

