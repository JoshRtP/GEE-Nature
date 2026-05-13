# TerraNexus Co-Benefit Platform — Version 2 Development Plan

**Date:** May 2026  
**Status:** Active development  
**Live project:** EMEA France — 2,361 GEE field units in Supabase  
**Repo:** https://github.com/JoshRtP/GEE-Nature

---

## Current State (v1 — Complete)

| Area | Status | Notes |
|---|---|---|
| React + TypeScript + Vite frontend | ✅ Done | Zero TS errors, clean build |
| Supabase PostgreSQL backend | ✅ Done | 4 tables: projects, spatial_units, qa_issues, community_indicators |
| GEE server-side compute (Python) | ✅ Done | `scripts/compute_france_metrics.py` |
| Real Leaflet satellite map + GeoJSON overlay | ✅ Done | 2,361 field boundaries from EMEA_France_26 |
| Sentinel-2 NDVI/NDMI/EVI/BSI/SAVI baseline + monitoring | ✅ Done | Per field, growing season composite |
| ESA WorldCover habitat class detection | ✅ Done | Habitat fractions computed |
| WRI Aqueduct v4 spatial join | ✅ Done | Per-field BWS score and risk class |
| TerraClimate CWD (climatic water deficit) | ✅ Done | Project-level mean stored |
| Habitat condition score (5-component formula) | ✅ Done | Baseline + monitoring per field |
| Project dashboard — KPI cards, radar chart | ✅ Done | Live Supabase data |
| Habitat tab — stacked bar, gain/loss chart | ✅ Done | Uses real spatial_units data |
| Water tab — WRI risk, CWD, SPEI display | ✅ Done | Real values displayed |
| Community/livelihood tab — data entry forms | ✅ Done | Saves to Supabase |
| QA/QC tab — issue table | ✅ Done | Auto-generated + manual |
| Export tab — CSV download | ✅ Done | Real spatial_unit metrics |
| Project creation wizard (5 steps) | ✅ Done | UI complete (backend pending) |
| Project renamed to "EMEA France" | ✅ Done | Single real project in Supabase |

---

## Known Bugs Requiring Immediate Fix

| Bug | Root Cause | Fix |
|---|---|---|
| `habitat_area_ha = 0` for all 2,361 units | `WorldCover.remap()` produces NoData pixels that `mean()` ignores | Add `.unmask(0)` after `remap()` |
| NDVI/NDMI time-series shows mock data | No `metric_timeseries` table exists; chart uses hardcoded series | Add table + GEE monthly pass |
| `spei3_min` is hardcoded to −1.8 | SPEI dataset removed to fix memory error | Re-add at project centroid level |
| Connectivity tab uses `simulatePatches()` | No real patch analysis in compute script | Add GEE connected-component metrics |

---

## Phase A — Data Completeness (Execute Now)

**Goal:** All core metrics are real GEE-derived values, not fallbacks or zeros.

### A1 — Fix Habitat Area (habitat_area_ha)
- Add `.unmask(0)` to `habitat_mask` before `reduceRegions` in compute script  
- Re-run script; verify non-zero habitat areas appear in HabitatTab  
- **File:** `scripts/compute_france_metrics.py`

### A2 — Add JRC Surface Water Metrics (New Pass)
New columns on `spatial_units`:
- `surface_water_occurrence_1km` — mean JRC occurrence % within 1 km buffer
- `surface_water_occurrence_5km` — mean JRC occurrence % within 5 km buffer  
- `permanent_water_1km_ha` — permanent water area (occurrence ≥ 90%) within 1 km
- `distance_to_water_m` — distance from field centroid to nearest persistent water pixel

GEE implementation: add as Pass 4 using `JRC/GSW1_4/GlobalSurfaceWater` `occurrence` band with `reduceRegions` at 30 m scale on 1 km buffered fields.

### A3 — SPEI Drought Score (Project Centroid Level)
- Compute at project centroid (single point, not per-field) to avoid memory errors  
- SPEI source: `CSIC/SPEI/2_10` → `SPEI_03_month` band  
- Store project-level `spei3_min` in `projects` table  
- Per-field: inherit project spei3_min (SPEI is too coarse for field-level variation)
- **File:** `scripts/compute_france_metrics.py`

### A4 — Monthly NDVI/NDMI Time Series
New Supabase table: `metric_timeseries`
```sql
project_id uuid, unit_id text (nullable = project-level),
metric_name text, period_month date, value numeric
```
GEE implementation: iterate monthly S2 composites 2019–2024, store median NDVI + NDMI per month at project level (not per-field — too many rows). Frontend: replace mock `TimeSeriesChart` data with Supabase query.

### A5 — Real Connectivity Metrics (Compute Script)
New columns on `spatial_units`:
- `patch_count` — number of contiguous habitat patches within field + 100 m buffer
- `core_habitat_ha` — habitat area > 30 m from non-habitat edge
- `edge_density` — total habitat edge / field area (m/ha)
- `mean_patch_size_ha` — mean patch area within field + buffer

GEE approach: `habitat_mask.connectedComponents(connectedness=ee.Kernel.plus(1), maxSize=256)` followed by `reduceRegions` to count unique component IDs. Core habitat: erode mask by 3 pixels (30 m at 10 m res) using `focal_min`.

**Migration required:** Add new columns to `spatial_units` + new `metric_timeseries` table.

---

## Phase B — Evidence Export (Next Sprint)

### B1 — GeoJSON Export with Live Metrics
- Merge `public/france_boundaries.geojson` features with per-unit metrics from Supabase  
- Download as `EMEA_France_metrics.geojson`  
- Each feature's `properties` = full `SpatialUnit` row + geometry  
- **File:** `src/pages/tabs/ExportTab.tsx`

### B2 — PDF Evidence Report (Client-Side)
- Use `jsPDF` + `html2canvas` for client-side generation  
- Report sections (per §16.3 of design doc):
  1. Cover page: project name, period, overall score
  2. Project boundary map (screenshot of Leaflet map)
  3. Dataset inventory table
  4. Methods summary (formulas + weights)
  5. Habitat extent results
  6. Habitat condition results
  7. Water-risk and drought-resilience results
  8. Connectivity results
  9. Community/livelihood indicators
  10. QA/QC exception table
  11. Limitations and claim boundaries
  12. Verra alignment crosswalk
- **File:** new `src/services/reportService.ts` + new `src/components/ReportPreview.tsx`
- **Install:** `npm install jspdf html2canvas`

### B3 — Verra Alignment Crosswalk Component
- Static data-driven table component  
- Maps each platform output → CCB relevance / SD VISta relevance / Nature Framework relevance  
- Show in ExportTab "report preview" section and in standalone downloadable PDF  
- **File:** new `src/components/VerraCrosswalk.tsx`

### B4 — Methods Appendix
- Render all formulas, weights, thresholds, dataset versions inline in ExportTab  
- Pull method version from a static `src/lib/methodConfig.ts` constant  
- Include dataset citation table: name, asset ID, version, resolution, access date

---

## Phase C — Platform Features (Following Sprint)

### C1 — Boundary Upload → GEE Trigger Pipeline
**Goal:** A user creates a new project in the wizard → uploads a GeoJSON boundary → GEE compute runs → metrics appear.

Architecture:
1. Wizard Step 3: Parse uploaded GeoJSON/KML/Shapefile in browser (use `togeojson` for KML, `shapefile` for zipped shp)
2. Upload parsed GeoJSON to Supabase Edge Function `upload-boundary`
3. Edge Function stores in Supabase Storage + inserts geometry into `project_boundaries` table
4. Trigger `gee-metrics` Edge Function with new project_id
5. Edge Function queues a GEE computation (REST API export task or synchronous for small AOIs)
6. Frontend polls project `status` field until `processed`

**Files:** 
- New migration: `project_boundaries` table with PostGIS geometry
- `supabase/functions/upload-boundary/index.ts`
- Updated `supabase/functions/gee-metrics/index.ts` to accept arbitrary boundary
- Updated `src/pages/ProjectWizard.tsx` Step 3

### C2 — Disturbance Score (Real)
- Currently hardcoded to 75.0 in compute script  
- Replace with: month where `NDVI < historical_percentile_20` for same calendar month  
- GEE: per-month `ImageCollection.reduce(ee.Reducer.percentile([20]))` over baseline  
- Compare monitoring month vs baseline p20; count disturbance events / total months  
- Feasible without memory errors if scoped to 1 Sentinel-2 tile area

### C3 — Reference Area Comparison
- Allow user to select nearby unmanaged reference fields from GEE asset  
- Compare project NDVI/NDMI vs reference NDVI/NDMI  
- Compute `reference_similarity_score` in the condition formula  
- Currently defaults to 75.0 in all fields

### C4 — Multiple Projects Support
- Create 2nd and 3rd test projects (Romania, Spain) using the compute script pattern  
- Add `--project` flag to compute script to select target asset + project name  
- Demonstrates multi-project dashboard view

---

## Phase D — Hardening and Pilot (Final Sprint)

### D1 — Authentication
- Add Supabase Auth (email + magic link)
- Tighten RLS policies from anon → authenticated only
- Per-user project isolation

### D2 — Versioned Calculations
- Add `calculation_version` and `method_version` columns to `spatial_units`
- Stamp every compute run with version + timestamp
- Allow historical run comparison

### D3 — Regression Test Suite
- Python tests for scoring formulas (pytest)
- React component tests (Vitest)
- End-to-end: create project → verify metric row written

### D4 — Performance
- Paginate spatial_units query (currently loads all 2,361 at once)
- Virtual scroll for MetricTable
- Lazy-load map GeoJSON on scroll into view

---

## Execution Order Summary

| Order | Phase | Task | Effort |
|---|---|---|---|
| 1 | A1 | Fix habitat_area_ha = 0 | 30 min |
| 2 | A2 | JRC surface water metrics | 2 h |
| 3 | A3 | SPEI at project centroid | 1 h |
| 4 | A4 | Monthly NDVI/NDMI time series | 3 h |
| 5 | A5 | Real connectivity metrics | 3 h |
| 6 | — | Re-run compute script + verify | 30 min |
| 7 | B1 | GeoJSON export with metrics | 1 h |
| 8 | B2 | PDF report (jsPDF) | 4 h |
| 9 | B3 | Verra crosswalk component | 2 h |
| 10 | B4 | Methods appendix | 1 h |
| 11 | C1 | Boundary upload pipeline | 5 h |
| 12 | C2 | Real disturbance score | 2 h |
| 13 | C3 | Reference area comparison | 2 h |
| 14 | C4 | Multi-project support | 2 h |
| 15 | D1–D4 | Hardening | 8 h |

---

## Database Schema Additions Required

### New columns on `spatial_units`
```sql
-- JRC Surface Water
surface_water_occurrence_1km  numeric DEFAULT 0,
surface_water_occurrence_5km  numeric DEFAULT 0,
permanent_water_1km_ha        numeric DEFAULT 0,
distance_to_water_m           numeric DEFAULT 0,

-- NDVI integrals (for condition formula)
ndvi_integral_baseline        numeric DEFAULT 0,
ndvi_integral_monitoring      numeric DEFAULT 0,

-- Connectivity
patch_count                   integer DEFAULT 0,
core_habitat_ha               numeric DEFAULT 0,
edge_density                  numeric DEFAULT 0,
mean_patch_size_ha            numeric DEFAULT 0,
```

### New table `metric_timeseries`
```sql
CREATE TABLE metric_timeseries (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  unit_id       text DEFAULT NULL,   -- null = project-level aggregate
  metric_name   text NOT NULL,       -- 'ndvi', 'ndmi', 'evi', 'bsi'
  period_month  date NOT NULL,       -- first day of month
  value         numeric NOT NULL,
  period_type   text NOT NULL DEFAULT 'monthly',   -- 'monthly'|'annual'
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_timeseries_project ON metric_timeseries(project_id);
CREATE INDEX idx_timeseries_metric  ON metric_timeseries(project_id, metric_name);
```

---

## Key Constraints and Decisions

| Constraint | Decision |
|---|---|
| GEE interactive `getInfo()` memory limit ~100 MB | Split into ≤ 5 separate `getInfo()` calls; keep each pass < 12 bands × 2361 features |
| SPEI dataset is coarse (0.5°) | Compute at project centroid only; store single value in `projects` table |
| WRI Aqueduct is FeatureCollection not Image | Use `ee.Join.saveFirst()` spatial join (not rasterization) |
| Monthly time series — 2361 fields × 72 months = too many rows | Store at project level (area-weighted mean) for time series chart |
| Connectivity (`connectedComponents`) on full asset | Run on individual field + 100 m buffer geometry, not full FeatureCollection |
| Boundary upload — arbitrary polygons | Accept GeoJSON; store raw; trigger GEE compute via Edge Function |
