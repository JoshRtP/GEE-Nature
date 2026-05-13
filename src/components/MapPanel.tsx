import { useState } from 'react';
import { Layers, Map as MapIcon } from 'lucide-react';
import { FRANCE_FIELD_CENTROIDS } from '../mock/seedData';

interface Layer {
  id: string;
  label: string;
  enabled: boolean;
}

interface Props {
  layers: Layer[];
  height?: number;
  caption?: string;
  projectId?: string;
}

// GEE asset EMEA_France_26 — Loire riparian corridor, Indre-et-Loire
// Viewport: lon 0.645–0.730, lat 47.370–47.415
const LON_MIN = 0.645, LON_MAX = 0.730;
const LAT_MIN = 47.368, LAT_MAX = 47.418;
const VW = 600, VH = 380;

function project(lon: number, lat: number) {
  const x = ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * VW;
  const y = VH - ((lat - LAT_MIN) / (LAT_MAX - LAT_MIN)) * VH;
  return { x, y };
}

function fieldPolygon(lon: number, lat: number, area_ha: number): string {
  const halfW = Math.sqrt(area_ha * 0.6) / 2 / 78000 * (LON_MAX - LON_MIN) * VW / (LON_MAX - LON_MIN);
  const halfH = Math.sqrt(area_ha * 0.6) / 2 / 111000 * (LAT_MAX - LAT_MIN) * VH / (LAT_MAX - LAT_MIN);
  const { x, y } = project(lon, lat);
  const jx = (lon * 127) % 5 - 2.5;
  const jy = (lat * 89) % 4 - 2;
  return [
    `${x - halfW + jx},${y - halfH}`,
    `${x + halfW},${y - halfH * 0.9 + jy}`,
    `${x + halfW * 0.95 - jx},${y + halfH}`,
    `${x - halfW * 0.9},${y + halfH * 0.95 - jy}`,
  ].join(' ');
}

function scoreColor(score: number) {
  if (score >= 75) return '#238636';
  if (score >= 65) return '#2ea043';
  if (score >= 55) return '#1a6326';
  return '#f59e0b';
}

// Loire river path (approximate sinuous path across the viewport)
const LOIRE_PATH = `M -10,310 C 60,295 130,320 200,300 C 270,280 310,305 380,285 C 440,268 510,290 610,275`;

function FranceMap({ showHabitat, showCondition, showWater }: { showHabitat?: boolean; showCondition?: boolean; showWater?: boolean }) {
  const scores: Record<string, number> = {
    'FR-01': 74, 'FR-02': 70, 'FR-03': 77, 'FR-04': 75,
    'FR-05': 80, 'FR-06': 78, 'FR-07': 76, 'FR-08': 79,
    'FR-09': 72, 'FR-10': 81,
  };

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} className="h-full w-full">
      <defs>
        <pattern id="topo" width="32" height="32" patternUnits="userSpaceOnUse">
          <rect width="32" height="32" fill="#1c2128" />
          <path d="M0 16 Q8 12 16 16 Q24 20 32 16" fill="none" stroke="#21262d" strokeWidth="0.6" />
        </pattern>
        <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#0284c7" stopOpacity="0.15" />
        </linearGradient>
        <filter id="fieldShadow" x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Base terrain */}
      <rect width={VW} height={VH} fill="url(#topo)" />

      {/* Floodplain zone */}
      {showWater && (
        <path
          d={`${LOIRE_PATH} L 610,${VH} L -10,${VH} Z`}
          fill="url(#waterGrad)"
        />
      )}

      {/* Loire river */}
      <path d={LOIRE_PATH} fill="none" stroke="#0369a1" strokeWidth="8" strokeLinecap="round" opacity="0.5" />
      <path d={LOIRE_PATH} fill="none" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" opacity="0.7" />

      {/* Riparian buffer strips */}
      {showHabitat && (
        <>
          <path d={`${LOIRE_PATH}`} fill="none" stroke="#238636" strokeWidth="24" strokeLinecap="round" opacity="0.12" />
          <path d={`${LOIRE_PATH}`} fill="none" stroke="#2ea043" strokeWidth="12" strokeLinecap="round" opacity="0.10" />
        </>
      )}

      {/* Field polygons from GEE asset centroids */}
      {FRANCE_FIELD_CENTROIDS.map(f => {
        const pts = fieldPolygon(f.lon, f.lat, f.area_ha);
        const score = scores[f.id] ?? 70;
        const fill = showCondition ? scoreColor(score) : (showHabitat ? '#238636' : '#30363d');
        return (
          <g key={f.id} filter="url(#fieldShadow)">
            <polygon
              points={pts}
              fill={fill}
              fillOpacity={showCondition ? 0.65 : 0.45}
              stroke="#238636"
              strokeWidth="1.2"
            />
            {showCondition && (
              <text
                x={project(f.lon, f.lat).x}
                y={project(f.lon, f.lat).y + 4}
                fontSize={8}
                textAnchor="middle"
                fill="#e6edf3"
                fontWeight="600"
                style={{ pointerEvents: 'none' }}
              >
                {score}
              </text>
            )}
          </g>
        );
      })}

      {/* Field labels */}
      {FRANCE_FIELD_CENTROIDS.map(f => {
        const { x, y } = project(f.lon, f.lat);
        return (
          <text
            key={`lbl-${f.id}`}
            x={x}
            y={y - Math.sqrt(f.area_ha * 0.6) / 2 / 111000 * (LAT_MAX - LAT_MIN) * VH / (LAT_MAX - LAT_MIN) - 4}
            fontSize={7.5}
            textAnchor="middle"
            fill="#8b949e"
            fontWeight="600"
            style={{ pointerEvents: 'none' }}
          >
            {f.id}
          </text>
        );
      })}

      {/* Scale bar */}
      <g transform={`translate(20,${VH - 22})`}>
        <line x1={0} y1={0} x2={60} y2={0} stroke="#484f58" strokeWidth="2" />
        <line x1={0} y1={-4} x2={0} y2={4} stroke="#484f58" strokeWidth="1.5" />
        <line x1={60} y1={-4} x2={60} y2={4} stroke="#484f58" strokeWidth="1.5" />
        <text x={30} y={-6} fontSize={8} textAnchor="middle" fill="#6e7681">~500 m</text>
      </g>

      {/* Legend */}
      {showCondition && (
        <g transform="translate(12,12)">
          <rect width={90} height={58} rx={4} fill="#161b22" fillOpacity={0.92} stroke="#30363d" />
          {[
            { color: '#238636', label: '≥75 (good)' },
            { color: '#2ea043', label: '65–74' },
            { color: '#1a6326', label: '55–64' },
            { color: '#f59e0b', label: '<55' },
          ].map((item, i) => (
            <g key={item.label} transform={`translate(6,${8 + i * 12})`}>
              <rect width={10} height={8} rx={1} fill={item.color} />
              <text x={14} y={7} fontSize={7.5} fill="#8b949e">{item.label}</text>
            </g>
          ))}
        </g>
      )}

      {/* Attribution */}
      <text x={VW - 8} y={VH - 6} fontSize={7} textAnchor="end" fill="#484f58">
        GEE asset: EMEA_France_26 · Loire riparian corridor
      </text>
    </svg>
  );
}

export function MapPanel({ layers: initialLayers, height = 380, caption, projectId }: Props) {
  const [layers, setLayers] = useState(initialLayers);

  const toggle = (id: string) =>
    setLayers(ls => ls.map(l => (l.id === id ? { ...l, enabled: !l.enabled } : l)));

  const showHabitat = layers.find(l => l.id === 'habitat')?.enabled;
  const showCondition = layers.find(l => l.id === 'condition')?.enabled;
  const showWater = layers.find(l => l.id === 'water_risk' || l.id === 'surface_water')?.enabled;
  const isFrance = projectId === 'seed-france';

  return (
    <div className="overflow-hidden rounded-xl border border-tn-border bg-tn-surface">
      <div className="flex items-center justify-between border-b border-tn-border px-4 py-2">
        <div className="flex items-center gap-2 text-sm font-medium text-tn-text">
          <MapIcon className="h-4 w-4 text-tn-accent" />
          Spatial preview
        </div>
        <span className="text-xs text-tn-text-subtle">
          {isFrance
            ? 'GEE asset EMEA_France_26 · field boundaries'
            : 'Mock layers · TODO: GEE tile integration'}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_220px]">
        <div className="relative" style={{ height }}>
          {isFrance ? (
            <FranceMap showHabitat={showHabitat} showCondition={showCondition} showWater={showWater} />
          ) : (
            <svg viewBox="0 0 600 400" className="h-full w-full bg-tn-surface2">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#21262d" strokeWidth="0.6" />
                </pattern>
                <pattern id="hab" width="8" height="8" patternUnits="userSpaceOnUse">
                  <rect width="8" height="8" fill="#1a6326" />
                  <path d="M0 0 L8 8" stroke="#238636" strokeWidth="0.6" />
                </pattern>
              </defs>
              <rect width="600" height="400" fill="url(#grid)" />
              {showWater ? (
                <path d="M0,260 C120,240 220,300 340,270 C460,240 540,290 600,270 L600,400 L0,400 Z" fill="#0369a1" opacity="0.25" />
              ) : null}
              {showHabitat ? (
                <g>
                  <polygon points="80,90 220,70 340,120 360,220 260,310 130,280 70,200" fill="url(#hab)" stroke="#238636" strokeWidth="1.5" />
                  <polygon points="380,150 470,120 540,180 510,260 410,260" fill="#1a6326" stroke="#2ea043" strokeWidth="1" opacity="0.75" />
                </g>
              ) : null}
              {showCondition ? (
                <g opacity="0.6">
                  {Array.from({ length: 60 }).map((_, i) => {
                    const x = 80 + (i % 12) * 22 + ((i * 7) % 6);
                    const y = 90 + Math.floor(i / 12) * 30 + ((i * 11) % 7);
                    const c = ['#f59e0b', '#1a6326', '#238636', '#2ea043', '#d97706'][i % 5];
                    return <rect key={i} x={x} y={y} width={18} height={18} rx={2} fill={c} />;
                  })}
                </g>
              ) : null}
              <polygon
                points="80,90 220,70 340,120 360,220 260,310 130,280 70,200"
                fill="none"
                stroke="#e6edf3"
                strokeWidth="2"
                strokeDasharray="6 4"
                opacity="0.4"
              />
              <text x={20} y={28} fontSize={11} fill="#6e7681">Project boundary</text>
            </svg>
          )}
        </div>
        <div className="border-t md:border-l md:border-t-0 border-tn-border bg-tn-hover/30 p-3">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-tn-text-subtle">
            <Layers className="h-3.5 w-3.5" /> Layers
          </div>
          <ul className="space-y-1.5">
            {layers.map(l => (
              <li key={l.id}>
                <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-tn-text-muted hover:bg-tn-hover transition-colors">
                  <input
                    type="checkbox"
                    checked={l.enabled}
                    onChange={() => toggle(l.id)}
                    className="h-3.5 w-3.5 rounded border-tn-border accent-tn-accent"
                  />
                  {l.label}
                </label>
              </li>
            ))}
          </ul>
          {caption ? <p className="mt-3 text-xs text-tn-text-subtle">{caption}</p> : null}
          {isFrance && (
            <div className="mt-3 rounded-md border border-tn-link/30 bg-tn-link/10 px-2 py-1.5 text-xs text-tn-link">
              10 field units · Loire riparian corridor · 47.4°N, 0.7°E
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
