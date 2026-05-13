import { Activity, Droplets, Layers, Network, Sprout, ShieldAlert, Users, Waves, BarChart3, AlertTriangle } from 'lucide-react';
import type { Project, QAIssue, SpatialUnit } from '../../types';
import { KPICard } from '../../components/ui/KPICard';
import { MapPanel } from '../../components/MapPanel';
import { Section } from '../../components/ui/Section';
import { RadarScoreChart } from '../../components/charts/RadarScoreChart';
import { BarChart } from '../../components/charts/BarChart';
import { QAWarningPanel } from '../../components/QAWarningPanel';

interface Props {
  project: Project;
  units: SpatialUnit[];
  issues: QAIssue[];
  layers: { id: string; label: string; enabled: boolean }[];
}

export function OverviewTab({ project, units, issues, layers }: Props) {
  const habitat = units.reduce((a, u) => a + u.habitat_area_ha, 0);
  const baselineAvg = avg(units.map(u => u.baseline_condition_score));
  const monitoringAvg = avg(units.map(u => u.monitoring_condition_score));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <KPICard label="Project area" value={project.area_ha.toLocaleString()} unit="ha" icon={Layers} />
        <KPICard label="Spatial units" value={units.length} icon={BarChart3} />
        <KPICard label="Habitat area" value={Math.round(habitat).toLocaleString()} unit="ha" icon={Sprout} tone="good" />
        <KPICard label="Habitat condition" value={Math.round(project.habitat_condition_score)} delta={Math.round(monitoringAvg - baselineAvg)} icon={Activity} tone="good" />
        <KPICard label="Connectivity" value={Math.round(project.connectivity_score)} icon={Network} />
        <KPICard label="Water risk" value={project.water_risk_class} icon={Droplets} tone={project.water_risk_class === 'high' || project.water_risk_class === 'extreme' ? 'warn' : 'default'} />
        <KPICard label="Drought resilience" value={Math.round(project.drought_resilience_score)} icon={Waves} />
        <KPICard label="Livelihood evidence" value={Math.round(project.livelihood_support_evidence_score)} icon={Users} tone={project.livelihood_support_evidence_score < 50 ? 'warn' : 'default'} />
        <KPICard label="Overall co-benefit" value={Math.round(project.overall_cobenefit_score)} icon={Activity} tone="good" />
        <KPICard label="QA warnings" value={project.qa_warning_count} icon={ShieldAlert} tone={project.qa_warning_count > 0 ? 'warn' : 'default'} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Section title="Project map" description="Satellite basemap · GEE field boundaries colour-coded by condition score" className="lg:col-span-2">
          <MapPanel layers={layers} projectId={project.id} units={units} caption="Live GEE field boundaries · ESA satellite basemap" />
        </Section>
        <Section title="Score radar" description="Component scores 0–100">
          <div className="flex justify-center">
            <RadarScoreChart
              axes={[
                { label: 'Habitat', value: project.habitat_condition_score },
                { label: 'Connectivity', value: project.connectivity_score },
                { label: 'Resilience', value: project.drought_resilience_score },
                { label: 'Livelihood', value: project.livelihood_support_evidence_score },
                { label: 'Erosion', value: 100 - avg(units.map(u => u.erosion_pressure_proxy)) },
              ]}
            />
          </div>
        </Section>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Section title="Baseline vs monitoring" description="Average condition score across spatial units." className="lg:col-span-2">
          <BarChart
            yLabel="Score"
            bars={[
              { label: 'Baseline', value: Math.round(baselineAvg), color: '#484f58' },
              { label: 'Monitoring', value: Math.round(monitoringAvg), color: '#238636' },
              { label: 'Habitat (ha/100)', value: Math.round(habitat / 100), color: '#0ea5e9' },
              { label: 'Connectivity', value: Math.round(project.connectivity_score), color: '#0d9488' },
              { label: 'Resilience', value: Math.round(project.drought_resilience_score), color: '#65a30d' },
              { label: 'Livelihood', value: Math.round(project.livelihood_support_evidence_score), color: '#f59e0b' },
            ]}
          />
        </Section>
        <Section
          title="QA warnings"
          actions={<span className="inline-flex items-center gap-1 text-xs text-yellow-400"><AlertTriangle className="h-3.5 w-3.5" />{issues.filter(i => !i.resolved).length} open</span>}
        >
          <QAWarningPanel issues={issues.slice(0, 5)} compact />
        </Section>
      </div>
    </div>
  );
}

function avg(arr: number[]) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}
