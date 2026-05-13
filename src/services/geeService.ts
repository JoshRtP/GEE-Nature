// Google Earth Engine service — fetches live metrics from EMEA_France_26 asset
// Auth is handled by useEarthEngine context (OAuth popup); call only when state === 'ready'

import ee, { GCP_PROJECT } from '../lib/ee';

// Asset is still in the original GEE project
const ASSET_ID = 'projects/gen-lang-client-0499108456/assets/EMEA_France_26';

export interface GEEFieldMetrics {
  unitId: string;
  areaHa: number;
  ndviMean: number;
  ndmiMean: number;
  evi: number;
  lon: number;
  lat: number;
}

export interface GEEImageryMetrics {
  units: GEEFieldMetrics[];
  acquisitionDate: string;
  source: string;
}

/** Fetch NDVI/NDMI/EVI means per field from Sentinel-2 SR for the Loire riparian corridor. */
export async function fetchFranceGEEMetrics(): Promise<GEEImageryMetrics> {
  return new Promise((resolve, reject) => {
    try {
      // Load the field boundary feature collection
      const fields = ee.FeatureCollection(ASSET_ID);

      // Sentinel-2 SR harmonised — last 90 days, cloud-filtered
      const now = ee.Date(Date.now());
      const s2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
        .filterBounds(fields)
        .filterDate(now.advance(-90, 'day'), now)
        .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
        .median();

      // Compute spectral indices
      const nir = s2.select('B8');
      const red = s2.select('B4');
      const swir = s2.select('B11');
      const blue = s2.select('B2');

      const ndvi = nir.subtract(red).divide(nir.add(red)).rename('NDVI');
      const ndmi = nir.subtract(swir).divide(nir.add(swir)).rename('NDMI');
      // EVI = 2.5 * (NIR-RED) / (NIR + 6*RED - 7.5*BLUE + 1)
      const evi = nir.subtract(red)
        .multiply(2.5)
        .divide(nir.add(red.multiply(6)).subtract(blue.multiply(7.5)).add(1))
        .rename('EVI');

      const composite = ndvi.addBands(ndmi).addBands(evi);

      // Reduce per field polygon
      const withMetrics = composite.reduceRegions({
        collection: fields,
        reducer: ee.Reducer.mean(),
        scale: 10,
        crs: 'EPSG:4326',
      });

      withMetrics.evaluate((result: GEEFeatureCollectionResult | null, error?: string) => {
        if (error || !result) {
          reject(new Error(error || 'GEE evaluate returned null'));
          return;
        }

        const units: GEEFieldMetrics[] = result.features.map((f, i) => {
          const props = f.properties ?? {};
          const coords = f.geometry?.coordinates;
          let lon = 0.69, lat = 47.38;
          if (coords) {
            // Centroid approx from bounding coords
            const flat = flatCoords(coords);
            lon = flat.reduce((a: number, c: number[]) => a + c[0], 0) / flat.length;
            lat = flat.reduce((a: number, c: number[]) => a + c[1], 0) / flat.length;
          }
          const area = props['area_ha'] ?? props['Area_ha'] ?? props['AREA_HA'] ?? estimateAreaFromGeom(f.geometry);
          return {
            unitId: props['unit_id'] ?? props['Unit_ID'] ?? props['id'] ?? `FR-${String(i + 1).padStart(2, '0')}`,
            areaHa: Number(area) || 50,
            ndviMean: clamp(Number(props['NDVI'] ?? props['ndvi'] ?? 0.55), 0, 1),
            ndmiMean: clamp(Number(props['NDMI'] ?? props['ndmi'] ?? 0.35), -1, 1),
            evi: clamp(Number(props['EVI'] ?? props['evi'] ?? 0.45), -1, 2),
            lon,
            lat,
          };
        });

        resolve({
          units,
          acquisitionDate: new Date().toISOString().slice(0, 10),
          source: 'Sentinel-2 SR Harmonised (COPERNICUS/S2_SR_HARMONISED)',
        });
      });
    } catch (err) {
      reject(err);
    }
  });
}

/** Fetch a Sentinel-2 map tile URL for the France project extent. */
export async function fetchFranceMapTileUrl(): Promise<string | null> {
  return new Promise((resolve) => {
    try {
      const fields = ee.FeatureCollection(ASSET_ID);
      const now = ee.Date(Date.now());
      const s2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
        .filterBounds(fields)
        .filterDate(now.advance(-90, 'day'), now)
        .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
        .median()
        .select(['B4', 'B3', 'B2']);

      const visParams = { min: 0, max: 3000, gamma: 1.4 };

      s2.getMapId(visParams, (mapId: GEEMapIdResult | null, error?: string) => {
        if (error || !mapId) { resolve(null); return; }
        const urlTemplate = `https://earthengine.googleapis.com/v1/${mapId.mapid}/tiles/{z}/{x}/{y}`;
        resolve(urlTemplate);
      });
    } catch {
      resolve(null);
    }
  });
}

// ---- helpers ----

interface GEEFeatureCollectionResult {
  type: string;
  features: Array<{
    type: string;
    geometry?: { type: string; coordinates: unknown };
    properties?: Record<string, unknown>;
  }>;
}

interface GEEMapIdResult {
  mapid: string;
  token?: string;
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function flatCoords(coords: unknown): number[][] {
  if (!Array.isArray(coords)) return [];
  if (typeof coords[0] === 'number') return [coords as unknown as number[]];
  return (coords as unknown[][]).flatMap(c => flatCoords(c));
}

function estimateAreaFromGeom(geom: { type: string; coordinates: unknown } | undefined): number {
  if (!geom) return 50;
  const flat = flatCoords(geom.coordinates);
  if (flat.length < 3) return 50;
  // Shoelace formula in degrees → approximate ha (1° lat ≈ 111km, 1° lon ≈ 78km at 47°N)
  let area = 0;
  for (let i = 0, j = flat.length - 1; i < flat.length; j = i++) {
    area += (flat[j][0] + flat[i][0]) * (flat[j][1] - flat[i][1]);
  }
  const degSq = Math.abs(area / 2);
  return degSq * 111000 * 78000 / 10000; // convert to ha
}
