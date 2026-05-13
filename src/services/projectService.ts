import { supabase } from '../lib/supabase';
import type { Project, SpatialUnit, QAIssue, CommunityIndicator, MetricTimeseries } from '../types';
import { SEED_PROJECTS } from '../mock/seedData';

// TODO: Backend/GEE integration — replace mock returns with real geospatial pipeline calls.

export async function ensureSeedProjects(): Promise<void> {
  const { data, error } = await supabase.from('projects').select('id').limit(1);
  if (error) throw error;
  if (data && data.length > 0) return;

  for (const seed of SEED_PROJECTS) {
    const { units, qa, community, id: _ignore, ...projectRow } = seed;
    void _ignore;
    const { data: inserted, error: insErr } = await supabase
      .from('projects')
      .insert(projectRow)
      .select()
      .maybeSingle();
    if (insErr || !inserted) continue;
    const pid = inserted.id;
    if (units.length) {
      await supabase.from('spatial_units').insert(units.map(u => ({ ...u, project_id: pid })));
    }
    if (qa.length) {
      await supabase.from('qa_issues').insert(qa.map(q => ({ ...q, project_id: pid })));
    }
    await supabase.from('community_indicators').insert({ ...community, project_id: pid });
  }
}

export async function fetchProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as Project[];
}

export async function fetchProject(id: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return (data as Project) || null;
}

export async function createProject(input: Partial<Project>): Promise<Project> {
  // TODO: trigger geometry validation and GEE baseline run on the backend.
  const payload = {
    name: input.name || 'Untitled Project',
    country: input.country || '',
    ecosystem_type: input.ecosystem_type || 'mixed',
    alignment: input.alignment || [],
    baseline_start: input.baseline_start || null,
    baseline_end: input.baseline_end || null,
    monitoring_start: input.monitoring_start || null,
    monitoring_end: input.monitoring_end || null,
    status: 'draft' as const,
  };
  const { data, error } = await supabase
    .from('projects')
    .insert(payload)
    .select()
    .maybeSingle();
  if (error || !data) throw error || new Error('Failed to create project');
  return data as Project;
}

export async function uploadBoundary(_projectId: string, _file: File): Promise<{ ok: true; warnings: string[] }> {
  // TODO: send file to backend for geometry validation and PostGIS storage.
  return { ok: true, warnings: ['MVP boundary upload is a placeholder; geometry validation runs on backend.'] };
}

export async function runGeospatialMetrics(_projectId: string): Promise<{ jobId: string }> {
  // TODO: enqueue GEE task and return real job id.
  return { jobId: `mock-${Date.now()}` };
}

export async function fetchProjectMetrics(projectId: string): Promise<SpatialUnit[]> {
  const { data, error } = await supabase
    .from('spatial_units')
    .select('*')
    .eq('project_id', projectId)
    .order('unit_id');
  if (error) throw error;
  return (data || []) as SpatialUnit[];
}

export async function fetchMapLayers(_projectId: string) {
  // TODO: return real map tile URLs from backend.
  return [
    { id: 'boundary', label: 'Project boundary', enabled: true },
    { id: 'habitat', label: 'Habitat extent', enabled: true },
    { id: 'condition', label: 'Habitat condition', enabled: false },
    { id: 'water_risk', label: 'WRI water risk', enabled: false },
    { id: 'surface_water', label: 'JRC surface water', enabled: false },
    { id: 'connectivity', label: 'Patch connectivity', enabled: false },
  ];
}

export async function fetchQAIssues(projectId: string): Promise<QAIssue[]> {
  const { data, error } = await supabase
    .from('qa_issues')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as QAIssue[];
}

export async function updateQAIssueResolved(id: string, resolved: boolean) {
  const { error } = await supabase.from('qa_issues').update({ resolved }).eq('id', id);
  if (error) throw error;
}

export async function fetchTimeSeries(
  projectId: string,
  metric: 'ndvi' | 'ndmi',
): Promise<MetricTimeseries[]> {
  const { data, error } = await supabase
    .from('metric_timeseries')
    .select('*')
    .eq('project_id', projectId)
    .eq('metric_name', metric)
    .is('unit_id', null)
    .order('period_month', { ascending: true });
  if (error) {
    // Table may not exist yet if migration hasn't been run — return empty
    return [];
  }
  return (data || []) as MetricTimeseries[];
}

export async function fetchCommunityIndicator(projectId: string): Promise<CommunityIndicator | null> {
  const { data, error } = await supabase
    .from('community_indicators')
    .select('*')
    .eq('project_id', projectId)
    .maybeSingle();
  if (error) throw error;
  return (data as CommunityIndicator) || null;
}

export async function updateCommunityIndicators(projectId: string, indicator: Partial<CommunityIndicator>) {
  const existing = await fetchCommunityIndicator(projectId);
  if (existing?.id) {
    const { error } = await supabase
      .from('community_indicators')
      .update({ ...indicator, updated_at: new Date().toISOString() })
      .eq('id', existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('community_indicators')
      .insert({ project_id: projectId, ...indicator });
    if (error) throw error;
  }
}

export async function generateEvidenceReport(_projectId: string): Promise<{ url: string }> {
  // TODO: invoke backend report generator.
  return { url: '#mock-report' };
}
