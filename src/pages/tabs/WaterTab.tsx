import type { Project, SpatialUnit } from '../../types';
import { Section } from '../../components/ui/Section';
import { MapPanel } from '../../components/MapPanel';
import { TimeSeriesChart } from '../../components/charts/TimeSeriesChart';
import { BarChart } from '../../components/charts/BarChart';
import { generateSPEISeries, generateDeficitSeries, generateFranceSPEISeries, generateFranceDeficitSeries } from '../../mock/seedData';
import { Droplets, AlertTriangle } from 'lucide-react';

interface Props {
  project: Project;
  units: SpatialUnit[];
  layers: { id: string; label: string; enabled: boolean }[];
}

const RISK_TONE: Record<string, string> = {
  low: 'bg-tn-accent/15 text-tn-accent ring-tn-accent/30',
  'low-medium': 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/30',
  'medium-high': 'bg-yellow-500/15 text-yellow-400 ring-yellow-500/30',
  high: 'bg-orange-500/15 text-orange-400 ring-orange-500/30',
  extreme: 'bg-red-500/15 text-red-400 ring-red-500/30',
  unknown: 'bg-tn-hover text-tn-text-muted ring-tn-border',
};

export function WaterTab({ project, units, layers }: Props) {
  const isFrance = project.id === 'seed-france' || project.name?.toLowerCase().includes('emea') || project.name?.toLowerCase().includes('loire');

  const spei = isFrance
    ? generateFranceSPEISeries()
    : generateSPEISeries().slice(-72);

  const deficit = isFrance
    ? generateFranceDeficitSeries()
    : generateDeficitSeries();

  const droughtRetention = isFrance ? [
    { label: 'Project drought 2022', value: 0.71, color: '#238636' },
    { label: 'Project normal 2024', value: 0.83, color: '#2ea043' },
    { label: 'Reference drought 2022', value: 0.58, color: '#484f58' },
    { label: 'Reference normal 2024', value: 0.79, color: '#30363d' },
  ] : [
    { label: 'Project drought', value: 0.78, color: '#238636' },
    { label: 'Project normal', value: 0.92, color: '#2ea043' },
    { label: 'Reference drought', value: 0.71, color: '#484f58' },
    { label: 'Reference normal', value: 0.9, color: '#30363d' },
  ];

  return (
    <div className="space-y-6">
      {isFrance && (
        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-300">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <p>
              The Loire basin experienced its worst recorded drought in summer 2022 (SPEI-3 reaching −2.9).
              Riparian vegetation in this project retained <strong>+13% more canopy cover</strong> than
              adjacent non-restored agricultural fields during this event.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-xl border border-tn-border bg-tn-surface p-4">
          <div className="text-xs font-semibold uppercase text-tn-text-subtle">WRI water risk class</div>
          <div className="mt-2">
            <span className={`inline-flex rounded-full px-2.5 py-1 text-sm font-semibold capitalize ring-1 ${RISK_TONE[project.water_risk_class]}`}>
              {project.water_risk_class}
            </span>
          </div>
          <p className="mt-2 text-xs text-tn-text-subtle">
            {isFrance ? 'WRI Aqueduct v4 · Loire sub-basin' : 'Aqueduct v4 baseline annual'}
          </p>
        </div>
        <Stat label="WRI baseline water stress" value={avg(units.map(u => u.wri_baseline_water_stress)).toFixed(2)} />
        <Stat
          label="TerraClimate deficit (mean)"
          value={`${Math.round(avg(units.map(u => u.terraclimate_deficit_mean)))} mm`}
          note={isFrance ? '2022 peak: 247 mm' : undefined}
        />
        <Stat label="Drought resilience score" value={Math.round(project.drought_resilience_score).toString()} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section
          title="TerraClimate climatic water deficit"
          description={isFrance ? 'Annual deficit, mm · Loire valley (Indre-et-Loire)' : 'Annual deficit, mm'}
        >
          <BarChart bars={deficit.map(d => ({
            label: String(d.year),
            value: d.deficit_mm,
            color: isFrance && d.year === 2022 ? '#f85149' : '#0ea5e9',
          }))} />
          {isFrance && (
            <p className="mt-2 text-xs text-tn-text-subtle">
              2022 deficit (+98 mm above 10-yr mean) driven by record summer temperatures.
              Restored riparian buffers significantly reduced peak soil water loss.
            </p>
          )}
        </Section>
        <Section
          title="SPEI-3 drought time series"
          description={isFrance
            ? 'Standardised Precipitation-Evapotranspiration Index · ERA5-Land · Loire basin'
            : 'Standardized Precipitation Evapotranspiration Index'}
        >
          <TimeSeriesChart
            yMin={-3}
            yMax={3}
            yLabel="SPEI-3"
            series={[{ label: 'SPEI-3', color: '#0d9488', data: spei.map(d => ({ x: d.date, y: d.spei3 })) }]}
          />
        </Section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section
          title="Surface-water context"
          description={isFrance
            ? 'JRC Global Surface Water + Loire floodplain · EMEA_France_26 field boundaries'
            : 'JRC Global Surface Water within buffers'}
        >
          <MapPanel
            layers={layers.map(l => ({ ...l, enabled: l.id === 'surface_water' || l.id === 'boundary' || l.enabled }))}
            caption={isFrance ? 'Loire floodplain and field boundaries from GEE asset EMEA_France_26' : 'Mock JRC overlay'}
            projectId={project.id}
          />
        </Section>
        <Section title="Drought-period vegetation performance" description="NDVI retention during drought months vs reference">
          <BarChart yLabel="NDVI retention" bars={droughtRetention} />
          <div className="mt-3 flex items-center gap-2 rounded-md border border-tn-accent/30 bg-tn-accent/10 px-3 py-2 text-xs text-tn-accent ring-1 ring-tn-accent/20">
            <Droplets className="h-3.5 w-3.5" />
            {isFrance
              ? <><span className="font-semibold">+13%</span> more canopy retained vs reference during the 2022 Loire drought.</>
              : <>Project retains <span className="font-semibold">+7%</span> more vegetation cover than reference during drought months.</>
            }
          </div>
        </Section>
      </div>
    </div>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-xl border border-tn-border bg-tn-surface p-4">
      <div className="text-xs font-semibold uppercase text-tn-text-subtle">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-tn-text">{value}</div>
      {note && <p className="mt-1 text-xs text-red-400 font-medium">{note}</p>}
    </div>
  );
}

function avg(arr: number[]) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}
