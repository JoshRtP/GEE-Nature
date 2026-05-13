import { FileSpreadsheet, FileJson, FileText, FileCheck, ShieldAlert, Network } from 'lucide-react';
import type { Project, QAIssue, SpatialUnit } from '../../types';
import { Section } from '../../components/ui/Section';
import { ExportCard } from '../../components/ExportCard';
import { Disclaimer } from '../../components/ui/Disclaimer';

interface Props {
  project: Project;
  units: SpatialUnit[];
  issues: QAIssue[];
}

export function ExportTab({ project, units, issues }: Props) {
  const downloadCSV = () => {
    const headers = [
      'project_id', 'unit_id', 'area_ha', 'habitat_area_ha', 'vegetated_area_ha',
      'habitat_change_ha', 'baseline_condition_score', 'monitoring_condition_score',
      'condition_change', 'connectivity_score', 'water_risk_class',
      'wri_baseline_water_stress', 'terraclimate_deficit_mean', 'spei3_min',
      'vegetation_drought_resilience_score', 'erosion_pressure_proxy',
      'surface_water_occurrence_1km', 'livelihood_support_evidence_score',
      'overall_cobenefit_score', 'qa_status', 'qa_warning_count',
    ];
    const rows = units.map(u => headers.map(h => (u as unknown as Record<string, unknown>)[h] ?? project.id).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${project.name.replace(/\s+/g, '_')}_metrics.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const downloadGeoJSON = async () => {
    try {
      const geo = await fetch('/france_boundaries.geojson').then(r => r.json());
      const unitMap: Record<string, unknown> = Object.fromEntries(
        units.map(u => [u.unit_id, u])
      );
      const enriched = {
        ...geo,
        features: geo.features.map((f: { properties: Record<string, unknown>; [k: string]: unknown }) => ({
          ...f,
          properties: { ...f.properties, ...(unitMap[f.properties.unit_id as string] || {}) },
        })),
      };
      const blob = new Blob([JSON.stringify(enriched)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${project.name.replace(/\s+/g, '_')}_metrics.geojson`; a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('GeoJSON boundaries file not found. Make sure france_boundaries.geojson is in /public/.');
    }
  };

  return (
    <div className="space-y-6">
      <Section title="Export options" description="Generate evidence-ready outputs for the current monitoring period.">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <ExportCard format="CSV" title="Metrics table" description="Spatial-unit metrics for analysis or audit." icon={FileSpreadsheet} onExport={downloadCSV} />
          <ExportCard format="GeoJSON" title="Spatial layer" description="Project boundary and metric attributes." icon={FileJson} onExport={downloadGeoJSON} />
          <ExportCard format="PDF" title="Evidence report" description="Full project evidence package." icon={FileText} />
          <ExportCard format="Methods" title="Methods appendix" description="Datasets, formulas, weights, and thresholds." icon={FileCheck} />
          <ExportCard format="QA" title="QA/QC exception report" description="All warnings, severities, and resolutions." icon={ShieldAlert} />
          <ExportCard format="Crosswalk" title="Verra alignment crosswalk" description="Map metrics to CCB / SD VISta / Nature Framework." icon={Network} />
        </div>
      </Section>

      <Section title="Report preview" description="Sections included in the generated PDF / DOCX evidence package.">
        <div className="grid gap-3 md:grid-cols-2">
          {[
            { t: 'Executive summary', d: `Overall co-benefit score ${Math.round(project.overall_cobenefit_score)} · ${units.length} spatial units · ${issues.filter(i => !i.resolved).length} open QA.` },
            { t: 'Project boundary', d: `${project.area_ha.toLocaleString()} ha · ${project.country} · ${project.ecosystem_type}.` },
            { t: 'Dataset inventory', d: 'Sentinel-2, Landsat C2, ESA WorldCover, WRI Aqueduct v4, TerraClimate, SPEIbase, JRC Surface Water.' },
            { t: 'Methods', d: 'Habitat extent, condition, connectivity, water risk, drought resilience, erosion proxy, livelihood evidence.' },
            { t: 'Habitat results', d: `Habitat area ${Math.round(project.habitat_area_ha)} ha · condition score ${Math.round(project.habitat_condition_score)}.` },
            { t: 'Water & resilience', d: `${project.water_risk_class} water risk · drought resilience ${Math.round(project.drought_resilience_score)}.` },
            { t: 'Connectivity', d: `Connectivity score ${Math.round(project.connectivity_score)}.` },
            { t: 'Community / livelihood', d: `Evidence score ${Math.round(project.livelihood_support_evidence_score)} · project records required for direct claims.` },
            { t: 'QA / QC', d: `${issues.length} flagged issues across geometry, imagery, dataset, metric, claim language.` },
            { t: 'Limitations', d: 'Coarse-resolution datasets and proxy metrics constrain field-level claims.' },
            { t: 'Verra alignment crosswalk', d: 'Metric-to-standard mapping for CCB, SD VISta, and Nature Framework.' },
          ].map(s => (
            <div key={s.t} className="rounded-lg border border-tn-border bg-tn-surface2 p-3">
              <div className="text-sm font-semibold text-tn-text">{s.t}</div>
              <div className="mt-0.5 text-xs text-tn-text-muted">{s.d}</div>
            </div>
          ))}
        </div>
      </Section>

      <Disclaimer text="Reports describe spatial indicators and project-entered records. They do not certify outcomes or issue credits." />
    </div>
  );
}
