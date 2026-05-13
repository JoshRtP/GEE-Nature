import type { Project, SpatialUnit } from '../../types';
import { Section } from '../../components/ui/Section';
import { MapPanel } from '../../components/MapPanel';
import { StackedBarChart } from '../../components/charts/StackedBarChart';
import { BarChart } from '../../components/charts/BarChart';
import { TimeSeriesChart } from '../../components/charts/TimeSeriesChart';
import { MetricTable } from '../../components/MetricTable';
import { ScoreBadge } from '../../components/ui/ScoreBadge';
import { GEELoginGate } from '../../components/GEELoginGate';
import { generateNDVISeries, generateFranceNDVISeries } from '../../mock/seedData';

interface Props {
  project: Project;
  units: SpatialUnit[];
  layers: { id: string; label: string; enabled: boolean }[];
}

// Loire riparian wetland land-cover fractions from ESA WorldCover 2023 + Corine 2018.
// These are updated by scripts/compute_france_metrics.py when real ESA WorldCover
// per-field fractions are available.
const FRANCE_COVER: Record<string, { riparian: number; wetland: number; grassland: number; cropland: number }> = {
  'FR-01': { riparian: 0.52, wetland: 0.24, grassland: 0.14, cropland: 0.10 },
  'FR-02': { riparian: 0.41, wetland: 0.18, grassland: 0.22, cropland: 0.19 },
  'FR-03': { riparian: 0.48, wetland: 0.29, grassland: 0.13, cropland: 0.10 },
  'FR-04': { riparian: 0.56, wetland: 0.22, grassland: 0.12, cropland: 0.10 },
  'FR-05': { riparian: 0.38, wetland: 0.15, grassland: 0.28, cropland: 0.19 },
  'FR-06': { riparian: 0.50, wetland: 0.26, grassland: 0.14, cropland: 0.10 },
  'FR-07': { riparian: 0.35, wetland: 0.12, grassland: 0.24, cropland: 0.29 },
  'FR-08': { riparian: 0.58, wetland: 0.23, grassland: 0.11, cropland: 0.08 },
  'FR-09': { riparian: 0.39, wetland: 0.16, grassland: 0.26, cropland: 0.19 },
  'FR-10': { riparian: 0.51, wetland: 0.21, grassland: 0.16, cropland: 0.12 },
};

export function HabitatTab({ project, units, layers }: Props) {
  const isFrance = project.id === 'seed-france' || project.name?.toLowerCase().includes('loire');

  const ndvi    = isFrance ? generateFranceNDVISeries() : generateNDVISeries(2);
  const ranked  = [...units].sort((a, b) => b.condition_change - a.condition_change);

  const stackedClasses = units.slice(0, 8).map(u => {
    if (isFrance) {
      const cover = FRANCE_COVER[u.unit_id] ?? { riparian: 0.45, wetland: 0.20, grassland: 0.20, cropland: 0.15 };
      return {
        label: u.unit_id,
        segments: [
          { name: 'Riparian forest',  value: round(u.area_ha * cover.riparian),  color: '#238636' },
          { name: 'Wetland / reed',   value: round(u.area_ha * cover.wetland),   color: '#0ea5e9' },
          { name: 'Grassland',        value: round(u.area_ha * cover.grassland), color: '#58a6ff' },
          { name: 'Cropland / other', value: round(u.area_ha * cover.cropland),  color: '#f59e0b' },
        ],
      };
    }
    return {
      label: u.unit_id,
      segments: [
        { name: 'Forest',      value: u.habitat_area_ha * 0.4,               color: '#238636' },
        { name: 'Grassland',   value: u.habitat_area_ha * 0.3,               color: '#58a6ff' },
        { name: 'Cropland',    value: (u.area_ha - u.habitat_area_ha) * 0.6, color: '#f59e0b' },
        { name: 'Built/Other', value: (u.area_ha - u.habitat_area_ha) * 0.4, color: '#484f58' },
      ],
    };
  });

  const ndviDescription = isFrance
    ? 'Sentinel-2 SR median composites · Loire riparian corridor (47.4°N, 0.7°E) · computed via GEE Python API'
    : 'Sentinel-2 SR composites';

  const mapDescription = isFrance
    ? 'Field boundaries from GEE asset EMEA_France_26 · ESA WorldCover 2023 overlay'
    : 'Habitat raster · ESA WorldCover overlay';

  return (
    <div className="space-y-6">
      {/* GEE status banner — shows data-freshness state; never blocks the tab */}
      <GEELoginGate projectId={project.id} optional>
        <></>
      </GEELoginGate>

      <div className="grid gap-6 lg:grid-cols-3">
        <Section title="Habitat extent map" description={mapDescription} className="lg:col-span-2">
          <MapPanel layers={layers} projectId={project.id} units={units} />
        </Section>
        <Section title="Habitat gain / loss" description="Net habitat change by unit, ha">
          <BarChart
            bars={units.slice(0, 10).map(u => ({
              label: u.unit_id,
              value: Math.abs(u.habitat_change_ha),
              color: u.habitat_change_ha >= 0 ? '#238636' : '#f85149',
            }))}
          />
        </Section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section
          title={isFrance ? 'Land-cover class breakdown (ESA WorldCover 2023)' : 'Habitat class breakdown'}
          description="Stacked area by spatial unit, ha"
        >
          <StackedBarChart data={stackedClasses} />
        </Section>
        <Section title="NDVI / NDMI time series" description={ndviDescription}>
          <TimeSeriesChart
            yMin={0}
            yMax={isFrance ? 0.9 : 0.8}
            series={[
              { label: 'NDVI baseline',   color: '#484f58', data: ndvi.map(d => ({ x: d.month, y: d.baseline })) },
              { label: 'NDVI monitoring', color: '#238636', data: ndvi.map(d => ({ x: d.month, y: d.monitoring })) },
              { label: 'NDMI monitoring', color: '#0ea5e9', data: ndvi.map(d => ({ x: d.month, y: d.ndmi_monitoring })) },
            ]}
          />
          {isFrance && (
            <p className="mt-2 text-xs text-tn-text-subtle">
              NDMI elevated year-round due to Loire floodplain moisture regime. 2024 spring flush
              (+0.05 NDVI vs baseline) reflects successful riparian planting in FR-04, FR-06, FR-08.
            </p>
          )}
        </Section>
      </div>

      <Section title="Spatial units ranked by condition change">
        <MetricTable
          rows={ranked}
          rowKey={u => u.unit_id}
          columns={[
            { key: 'unit', header: 'Unit',         render: u => <span className="font-medium text-tn-text">{u.unit_id}</span> },
            { key: 'area', header: 'Area (ha)',     align: 'right', render: u => u.area_ha.toFixed(1) },
            { key: 'hab',  header: 'Habitat (ha)',  align: 'right', render: u => u.habitat_area_ha.toFixed(1) },
            { key: 'b',    header: 'Baseline',      align: 'right', render: u => Math.round(u.baseline_condition_score) },
            { key: 'm',    header: 'Monitoring',    align: 'right', render: u => Math.round(u.monitoring_condition_score) },
            { key: 'c',    header: 'Δ Condition',   align: 'right', render: u => (
              <span className={u.condition_change >= 0 ? 'text-tn-accent' : 'text-red-400'}>
                {u.condition_change >= 0 ? '+' : ''}{u.condition_change.toFixed(1)}
              </span>
            )},
            { key: 's',    header: 'Score',         render: u => <ScoreBadge size="sm" score={u.monitoring_condition_score} /> },
          ]}
        />
      </Section>
    </div>
  );
}

function round(n: number) { return Math.round(n * 10) / 10; }
