import type { SpatialUnit } from '../../types';
import { Section } from '../../components/ui/Section';
import { MapPanel } from '../../components/MapPanel';
import { BarChart } from '../../components/charts/BarChart';
import { KPICard } from '../../components/ui/KPICard';
import { Network, Boxes, Trees, Ruler, GitBranch } from 'lucide-react';

interface Props {
  units: SpatialUnit[];
  layers: { id: string; label: string; enabled: boolean }[];
}

export function ConnectivityTab({ units, layers }: Props) {
  const patches = units.flatMap(u => simulatePatches(u));
  const meanPatch = patches.length ? patches.reduce((a, b) => a + b, 0) / patches.length : 0;
  const core = Math.round(units.reduce((a, u) => a + u.habitat_area_ha * 0.62, 0));
  const edgeDensity = round(180 + Math.random() * 60, 1);
  const connectivity = round(units.reduce((a, u) => a + u.connectivity_score, 0) / Math.max(1, units.length));

  const sizeBuckets = [
    { range: '<5', count: patches.filter(p => p < 5).length },
    { range: '5–15', count: patches.filter(p => p >= 5 && p < 15).length },
    { range: '15–30', count: patches.filter(p => p >= 15 && p < 30).length },
    { range: '30–60', count: patches.filter(p => p >= 30 && p < 60).length },
    { range: '60–120', count: patches.filter(p => p >= 60 && p < 120).length },
    { range: '120+', count: patches.filter(p => p >= 120).length },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <KPICard label="Patch count" value={patches.length} icon={Boxes} />
        <KPICard label="Mean patch size" value={meanPatch.toFixed(1)} unit="ha" icon={Trees} />
        <KPICard label="Core habitat" value={core.toLocaleString()} unit="ha" icon={Trees} tone="good" />
        <KPICard label="Edge density" value={edgeDensity} unit="m/ha" icon={Ruler} />
        <KPICard label="Connectivity score" value={connectivity} icon={Network} tone="good" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Section title="Patch map" description="Mock patches and corridors · TODO: connected component analysis." className="lg:col-span-2">
          <MapPanel layers={layers} caption="Patch identification runs server-side over the habitat raster." />
        </Section>
        <Section title="Patch size histogram" description="Distribution of patch areas (ha)">
          <BarChart bars={sizeBuckets.map(b => ({ label: b.range, value: b.count, color: '#238636' }))} />
        </Section>
      </div>

      <Section title="Distance-to-habitat" description="Mean distance from non-habitat to nearest habitat (m)">
        <div className="flex items-center gap-3 text-sm text-tn-text-muted">
          <GitBranch className="h-4 w-4 text-tn-accent" />
          <div className="relative h-3 flex-1 rounded-full bg-gradient-to-r from-tn-accent via-yellow-400 to-red-500">
            <span className="absolute -top-7 left-[28%] text-xs font-medium text-tn-text">Project mean: 84 m</span>
            <span className="absolute -top-7 right-[10%] text-xs font-medium text-tn-text">Buffer max: 1.2 km</span>
            <span className="absolute -bottom-5 left-0 text-[10px] text-tn-text-subtle">0 m</span>
            <span className="absolute -bottom-5 right-0 text-[10px] text-tn-text-subtle">1500 m</span>
          </div>
        </div>
      </Section>
    </div>
  );
}

function simulatePatches(u: SpatialUnit): number[] {
  const total = u.habitat_area_ha;
  const out: number[] = [];
  let remaining = total;
  let i = 1;
  while (remaining > 1 && i < 12) {
    const sz = Math.max(1, remaining * (0.15 + Math.abs(Math.sin(i + total / 17)) * 0.35));
    out.push(round(sz, 1));
    remaining -= sz;
    i++;
  }
  return out;
}

function round(n: number, d = 0) { const f = Math.pow(10, d); return Math.round(n * f) / f; }
