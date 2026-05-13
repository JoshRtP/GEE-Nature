/**
 * MapPanel — real interactive Leaflet map with satellite basemap and GEE field boundaries.
 *
 * For the France (EMEA_France_26) project, loads /france_boundaries.geojson
 * and colour-codes fields by monitoring condition score (from SpatialUnit props).
 * Falls back to a simple basemap placeholder for other projects.
 */
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Layers, AlertCircle } from 'lucide-react';
import type { SpatialUnit } from '../types';

// Fix Leaflet default icon paths broken by Vite bundling
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

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
  /** Pass real spatial units so fields can be coloured by live GEE scores */
  units?: SpatialUnit[];
}

// Colour ramp: monitoring_condition_score 0–100
function scoreToColor(score: number): string {
  if (score >= 80) return '#4ade80';  // bright green
  if (score >= 70) return '#86efac';  // light green
  if (score >= 60) return '#60a5fa';  // blue
  if (score >= 50) return '#fb923c';  // orange
  return '#f87171';                   // red
}

// Tile providers
const TILE_LAYERS = {
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics',
    maxZoom: 19,
  },
  osm: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  },
};

export function MapPanel({ layers: initialLayers, height = 420, caption, projectId, units = [] }: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const geoLayerRef = useRef<L.GeoJSON | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const [layerToggles, setLayerToggles] = useState(initialLayers);
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [basemap, setBasemap] = useState<'satellite' | 'osm'>('satellite');
  const [showCondition, setShowCondition] = useState(true);

  const isFrance = projectId === 'seed-france' || projectId != null;

  // Build score lookup from spatial units
  const scoreByUnitId = Object.fromEntries(
    units.map(u => [u.unit_id, u.monitoring_condition_score ?? 60])
  );

  // Initialise map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: isFrance ? [47.38, 0.19] : [47.38, 0.19],
      zoom: isFrance ? 12 : 5,
      zoomControl: true,
      attributionControl: true,
    });

    // Add a custom "mask" pane that sits above tiles but below vectors
    // to allow a semi-transparent dark overlay
    map.createPane('maskPane');
    const maskPaneEl = map.getPane('maskPane');
    if (maskPaneEl) maskPaneEl.style.zIndex = '250';

    const t = TILE_LAYERS[basemap];
    tileLayerRef.current = L.tileLayer(t.url, {
      attribution: t.attribution,
      maxZoom: t.maxZoom,
      opacity: 0.55,   // dim the satellite so coloured fields stand out
    }).addTo(map);

    // Semi-transparent dark rectangle covering the whole world as a mask
    L.rectangle([[-90, -180], [90, 180]], {
      pane: 'maskPane',
      color: 'transparent',
      fillColor: '#000000',
      fillOpacity: 0.38,
      stroke: false,
      interactive: false,
    } as L.PolylineOptions).addTo(map);

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Swap basemap
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (tileLayerRef.current) map.removeLayer(tileLayerRef.current);
    const t = TILE_LAYERS[basemap];
    tileLayerRef.current = L.tileLayer(t.url, {
      attribution: t.attribution,
      maxZoom: t.maxZoom,
      opacity: 0.55,
    }).addTo(map);
    // Ensure tile is below mask pane
    tileLayerRef.current.setZIndex(1);
  }, [basemap]);

  // Load and render GeoJSON boundaries
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isFrance) return;

    setLoadState('loading');

    fetch('/france_boundaries.geojson')
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((geojson: GeoJSON.FeatureCollection) => {
        // Remove old layer
        if (geoLayerRef.current) {
          map.removeLayer(geoLayerRef.current);
        }

        const layer = L.geoJSON(geojson, {
          style: (feat) => {
            const uid = feat?.properties?.unit_id as string;
            const score = scoreByUnitId[uid] ?? 60;
            return {
              color: '#ffffff',
              weight: 1.5,
              fillColor: showCondition ? scoreToColor(score) : '#4ade80',
              fillOpacity: 0.78,
              opacity: 0.7,
            };
          },
          onEachFeature: (feat, layer) => {
            const uid = feat.properties?.unit_id as string;
            const score = scoreByUnitId[uid];
            layer.bindTooltip(
              `<strong>${uid}</strong>${score != null ? `<br/>Condition score: <b>${Math.round(score)}</b>` : ''}`,
              { sticky: true, className: 'tn-tooltip' }
            );
          },
        }).addTo(map);

        geoLayerRef.current = layer;

        // Fit bounds to the GeoJSON extent
        const bounds = layer.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [20, 20] });
        }

        setLoadState('done');
      })
      .catch(err => {
        console.error('GeoJSON load failed:', err);
        setLoadState('error');
      });
  // Restyle when scores or showCondition changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFrance, showCondition, units.length]);

  // Restyle when scores update (without re-fetching)
  useEffect(() => {
    if (!geoLayerRef.current || units.length === 0) return;
    geoLayerRef.current.setStyle((feat) => {
      const uid = feat?.properties?.unit_id as string;
      const score = scoreByUnitId[uid] ?? 60;
      return {
        color: '#ffffff',
        weight: 1.5,
        fillColor: showCondition ? scoreToColor(score) : '#4ade80',
        fillOpacity: 0.78,
        opacity: 0.7,
      };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCondition, units.length]);

  return (
    <div className="overflow-hidden rounded-xl border border-tn-border bg-tn-surface">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-tn-border px-3 py-2">
        <div className="flex items-center gap-2 text-xs font-medium text-tn-text">
          <Layers className="h-3.5 w-3.5 text-tn-accent" />
          {isFrance
            ? 'EMEA France · EMEA_France_26 · 2,361 field units'
            : 'Interactive map'}
        </div>
        <div className="flex items-center gap-2">
          {/* Basemap toggle */}
          <div className="flex rounded-md overflow-hidden border border-tn-border text-[11px]">
            {(['satellite', 'osm'] as const).map(b => (
              <button
                key={b}
                onClick={() => setBasemap(b)}
                className={`px-2 py-0.5 capitalize transition-colors ${
                  basemap === b
                    ? 'bg-tn-accent text-white'
                    : 'bg-tn-surface text-tn-text-muted hover:text-tn-text'
                }`}
              >
                {b === 'satellite' ? 'Satellite' : 'OSM'}
              </button>
            ))}
          </div>
          {/* Condition score toggle */}
          <button
            onClick={() => setShowCondition(c => !c)}
            className={`rounded-md border px-2 py-0.5 text-[11px] transition-colors ${
              showCondition
                ? 'border-tn-accent/40 bg-tn-accent/15 text-tn-accent'
                : 'border-tn-border bg-tn-surface text-tn-text-muted hover:text-tn-text'
            }`}
          >
            Condition score
          </button>
        </div>
      </div>

      {/* Map container */}
      <div className="relative" style={{ height }}>
        <div ref={containerRef} className="absolute inset-0" />

        {/* Loading overlay */}
        {loadState === 'loading' && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-tn-bg/60 z-[400]">
            <div className="flex items-center gap-2 rounded-lg border border-tn-border bg-tn-surface px-4 py-2 text-xs text-tn-text-muted shadow-lg">
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-tn-accent border-t-transparent" />
              Loading 2,361 field boundaries…
            </div>
          </div>
        )}

        {/* Error overlay */}
        {loadState === 'error' && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-tn-bg/70 z-[400]">
            <div className="flex items-center gap-2 rounded-lg border border-red-500/40 bg-tn-surface px-4 py-2 text-xs text-red-400 shadow-lg">
              <AlertCircle className="h-4 w-4" />
              Could not load field boundaries
            </div>
          </div>
        )}

        {/* Condition score legend */}
        {showCondition && loadState === 'done' && (
          <div className="absolute bottom-6 left-2 z-[400] rounded-md border border-tn-border bg-tn-bg/90 px-2.5 py-2 text-[11px] shadow-lg backdrop-blur-sm">
            <div className="mb-1 font-semibold text-tn-text-muted uppercase tracking-wide text-[10px]">
              Condition score
            </div>
            {[
              { color: '#4ade80', label: '≥80' },
              { color: '#86efac', label: '70–79' },
              { color: '#60a5fa', label: '60–69' },
              { color: '#fb923c', label: '50–59' },
              { color: '#f87171', label: '<50' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-1.5 leading-5">
                <span className="inline-block h-3 w-3 rounded-sm" style={{ background: item.color }} />
                <span className="text-tn-text-muted">{item.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Caption / attribution */}
      {caption && (
        <div className="border-t border-tn-border px-3 py-1.5 text-[11px] text-tn-text-subtle">
          {caption}
        </div>
      )}
    </div>
  );
}
