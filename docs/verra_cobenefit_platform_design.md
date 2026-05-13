# Verra-Aligned Co-Benefit, Biodiversity, and Resilience Monitoring Platform

## Detailed MVP Design Document for Developers and AI Coding Tools

**Document purpose:** Provide a single-file product and technical specification for building an MVP platform that uses Google Earth Engine (GEE) and project-entered data to quantify biodiversity, ecosystem resilience, water-risk, land-condition, and livelihood-support co-benefit indicators for land-based sustainability projects.

**Target users:** Project developers, carbon project consultants, corporate sustainability teams, nature/biodiversity program teams, auditors/reviewers, and internal analysts.

**Primary alignment:** Verra CCB Standards, SD VISta claims/labels, Verra Nature Framework project-development support, and corporate sustainability reporting.

**Important boundary:** This platform does not issue Verra credits, certify outcomes, replace validation/verification, or prove species/livelihood outcomes from satellite data alone. It generates auditable geospatial evidence and structured project data that can support Verra-aligned documentation.

---

# 1. Product Concept

## 1.1 Platform Purpose

Build a geospatial monitoring platform that quantifies biodiversity, ecosystem resilience, water-risk, land-condition, and community/livelihood co-benefit indicators for land-based sustainability projects.

The platform is designed to supplement:

1. Verra VCS carbon projects that want stronger co-benefit evidence.
2. CCB Standards validation / verification packages.
3. SD VISta measured-benefit claims or labels.
4. Emerging Verra Nature Framework / biodiversity outcome project development.
5. Corporate sustainability and nature-positive programs.

The platform should not represent itself as a certification or credit-issuance system. It should generate field- and project-level metrics, maps, QA/QC flags, data exports, and evidence reports that can be reviewed by project teams, auditors, or third-party verifiers.

## 1.2 Recommended Product Statement

> The platform uses Google Earth Engine and project-entered data to quantify biodiversity, ecosystem resilience, water-risk, land-condition, and livelihood-support indicators for land-based sustainability projects. It produces field- and project-level metrics, maps, QA/QC flags, and evidence exports that can support CCB, SD VISta, Verra Nature Framework project development, and corporate sustainability reporting.

## 1.3 Core Design Principle

Separate three categories of evidence:

1. **GEE-derived spatial evidence**  
   Habitat extent, vegetation condition, water risk, drought exposure, surface-water context, bare soil, erosion-pressure proxies, connectivity, and resilience indicators.

2. **Project-entered evidence**  
   Participation records, benefit-sharing records, training records, grievance records, stakeholder consultation records, survey results, and safeguards documentation.

3. **Claim / report outputs**  
   Conservative, traceable statements that clearly distinguish measured geospatial indicators from direct social, ecological, or livelihood outcomes.

---

# 2. MVP Scope

## 2.1 What the MVP Must Do

The MVP calculates and reports:

1. Habitat extent.
2. Habitat condition.
3. Habitat change.
4. Landscape connectivity.
5. Bare-soil / erosion-pressure proxy.
6. Water-risk and drought exposure.
7. Surface-water context.
8. Vegetation resilience.
9. Livelihood-support proxies.
10. Project-entered community/livelihood indicators.
11. QA/QC warnings and confidence flags.
12. Verra-aligned evidence exports.

## 2.2 What the MVP Must Not Do

The MVP must not claim to:

1. Issue Verra credits.
2. Certify CCB, SD VISta, or Nature Framework outcomes.
3. Replace Verra validation or verification.
4. Prove species abundance without field data.
5. Prove household income or livelihood improvement from satellite data alone.
6. Replace stakeholder engagement records.
7. Replace safeguards documentation.
8. Replace VVB review.
9. Replace a formal Nature Credit methodology.

## 2.3 MVP Success Criteria

The MVP is successful when a user can:

1. Create a project.
2. Upload a project boundary and optional field/community/reference polygons.
3. Select baseline and monitoring periods.
4. Run geospatial calculations.
5. Review maps, charts, KPI cards, and QA warnings.
6. Enter community/livelihood project records.
7. Export a CSV/GeoJSON metrics table.
8. Generate a draft evidence report with methods, data sources, limitations, QA flags, and Verra-alignment crosswalk.

---

# 3. Core Users and Workflows

## 3.1 User Types

| User Type | Needs |
|---|---|
| Project developer | Upload boundaries, calculate co-benefit metrics, export evidence package. |
| Carbon project consultant | Add co-benefit evidence to VCS/CCB/SD VISta projects. |
| Corporate sustainability team | Screen projects for biodiversity, water, resilience, and livelihood value. |
| Auditor/reviewer | Review methods, inputs, outputs, QA flags, and evidence. |
| Data analyst | Inspect raw layers, thresholds, time windows, formulas, and outputs. |
| Admin | Manage datasets, method versions, permissions, and project templates. |

## 3.2 Primary User Workflow

1. Create project.
2. Upload project boundary.
3. Upload optional field, reference, habitat, and community polygons.
4. Select project type and ecosystem context.
5. Select baseline and monitoring periods.
6. Configure habitat class mapping.
7. Configure thresholds and weights or accept defaults.
8. Run geospatial metric calculations.
9. Enter project-level community/livelihood records.
10. Review QA/QC flags and low-confidence metrics.
11. Review dashboards and map layers.
12. Export metrics and evidence package.

---

# 4. Recommended Technical Architecture

## 4.1 Suggested Stack

**Frontend**

- React / Next.js.
- Map UI using Leaflet, Mapbox GL, Google Maps, or equivalent.
- Dashboard charts using Recharts, Plotly, ECharts, or similar.

**Backend**

- Python FastAPI or Node.js/Express.
- API endpoints for project management, file upload, GEE task orchestration, metric storage, and report generation.

**Geospatial Engine**

- Google Earth Engine for raster/vector analysis.
- PostGIS for uploaded geometries and metadata.

**Database**

- PostgreSQL + PostGIS.

**Object Storage**

- Google Cloud Storage, Azure Blob, or S3 for uploaded files, map images, exported rasters, evidence files, and generated reports.

**Queue / Background Jobs**

- Celery, Cloud Tasks, Pub/Sub, BullMQ, or equivalent for long-running calculations.

**Authentication**

- Auth0, Firebase Auth, Microsoft Entra, Supabase Auth, Clerk, or equivalent.

**Report Generation**

- HTML-to-PDF, DOCX/PDF generator, or Python-based report engine.

## 4.2 Architecture Diagram

```text
User Interface
  |
  |-- Project setup
  |-- Boundary upload
  |-- Dashboard review
  |-- Evidence export
  |
Backend API
  |
  |-- Auth and permissions
  |-- Project metadata
  |-- File handling
  |-- GEE task orchestration
  |-- Metric persistence
  |-- Report generation
  |
PostgreSQL/PostGIS           Object Storage
  |                           |
  |-- Project tables           |-- Uploads
  |-- Geometry tables          |-- Generated maps
  |-- Metric tables            |-- Reports
  |-- QA tables                |-- Evidence files
  |
Google Earth Engine
  |
  |-- Public datasets
  |-- User geometries
  |-- Metric calculations
  |-- Map tiles and exports
```

---

# 5. Core Data Model

## 5.1 Project

```json
{
  "project_id": "string",
  "project_name": "string",
  "developer": "string",
  "country": "string",
  "verra_alignment": ["CCB", "SD_VISta", "Nature_Framework", "Corporate"],
  "baseline_start": "YYYY-MM-DD",
  "baseline_end": "YYYY-MM-DD",
  "monitoring_start": "YYYY-MM-DD",
  "monitoring_end": "YYYY-MM-DD",
  "ecosystem_type": "cropland | grassland | forest | agroforestry | wetland | mixed",
  "status": "draft | processing | processed | reviewed | exported",
  "created_by": "user_id",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

## 5.2 Spatial Unit

```json
{
  "unit_id": "string",
  "project_id": "string",
  "unit_type": "project_area | field | habitat_patch | community_area | buffer_area | reference_area",
  "geometry": "PostGIS geometry",
  "area_ha": "number",
  "source_file": "string",
  "qa_geometry_valid": "boolean",
  "qa_notes": "string"
}
```

## 5.3 Metric Result

```json
{
  "metric_id": "string",
  "project_id": "string",
  "unit_id": "string",
  "metric_name": "string",
  "metric_value": "number | string | boolean | null",
  "metric_units": "string",
  "period": "baseline | monitoring | change | reference",
  "calculation_version": "string",
  "dataset_version": "string",
  "qa_status": "pass | warning | fail",
  "confidence_score": "number",
  "created_at": "timestamp"
}
```

## 5.4 Project-Entered Community / Livelihood Record

```json
{
  "record_id": "string",
  "project_id": "string",
  "indicator_type": "participation | benefit_sharing | training | employment | grievance | survey | consultation | safeguard",
  "indicator_name": "string",
  "value": "number | text",
  "units": "string",
  "evidence_file": "string",
  "reporting_period": "string",
  "qa_status": "pass | warning | fail",
  "created_at": "timestamp"
}
```

## 5.5 QA/QC Issue

```json
{
  "qa_issue_id": "string",
  "project_id": "string",
  "unit_id": "string | null",
  "issue_type": "geometry | dataset | imagery | metric | report | claim_language | user_input",
  "severity": "info | warning | fail",
  "message": "string",
  "recommended_action": "string",
  "resolved": "boolean",
  "resolved_by": "user_id | null",
  "created_at": "timestamp"
}
```

## 5.6 Method Version

```json
{
  "method_id": "string",
  "method_name": "string",
  "method_version": "string",
  "formula": "string",
  "weights": "json",
  "thresholds": "json",
  "datasets": "json",
  "created_at": "timestamp",
  "active": "boolean"
}
```

---

# 6. Dataset Inventory

## 6.1 Required GEE Datasets

| Purpose | Dataset | GEE Asset |
|---|---|---|
| Sentinel-2 vegetation and land condition | Sentinel-2 Surface Reflectance Harmonized | `COPERNICUS/S2_SR_HARMONIZED` |
| Long-term vegetation / land-cover change | Landsat Collection 2 | `LANDSAT/*/C02/T1_L2` |
| Habitat / land-cover baseline | ESA WorldCover | `ESA/WorldCover/v100`, `ESA/WorldCover/v200` |
| Water-risk screen | WRI Aqueduct v4 | `WRI/Aqueduct_Water_Risk/V4/baseline_annual` |
| Climate water balance | TerraClimate | `IDAHO_EPSCOR/TERRACLIMATE` |
| Drought | SPEIbase | `CSIC/SPEI/2_10` |
| Surface water | JRC Global Surface Water | `JRC/GSW1_4/GlobalSurfaceWater` |
| Annual surface water | JRC Yearly History | `JRC/GSW1_4/YearlyHistory` |
| Topography | Copernicus DEM / SRTM | Use available GEE DEM source by region |

## 6.2 Recommended External / Uploaded Datasets

| Dataset | Use |
|---|---|
| Natura 2000 polygons | Protected-area / biodiversity context in Europe. |
| WDPA protected areas | Global protected-area context. |
| IUCN range maps | Species habitat screening. |
| GBIF occurrence points | Species occurrence context. |
| OpenStreetMap roads / settlements | Human pressure / access metrics. |
| National cadastral / parcel data | Land tenure and field identity. |
| Project stakeholder/community polygons | Community exposure and benefit area. |
| Project ecological survey data | Species, habitat, biodiversity validation. |
| Project livelihood survey data | Household or community outcome metrics. |
| Project activity records | Interventions, training, payments, participation. |

## 6.3 Dataset Versioning Requirements

Each metric output must preserve:

1. Dataset name.
2. Dataset asset ID.
3. Dataset version if known.
4. Date accessed or processed.
5. Time period used.
6. Spatial resolution.
7. Any filtering or masking applied.
8. Calculation method version.

---

# 7. Core Modules

The MVP should include nine modules:

1. Project setup and boundary ingestion.
2. Baseline period builder.
3. Habitat extent module.
4. Habitat condition module.
5. Connectivity and fragmentation module.
6. Water-risk and drought-resilience module.
7. Land degradation / erosion-pressure module.
8. Community and livelihood-support module.
9. Evidence export and Verra alignment module.

---

# 8. Module 1 — Project Setup and Boundary Ingestion

## 8.1 Purpose

Allow users to define project boundaries, field boundaries, reference areas, community areas, and reporting periods.

## 8.2 Inputs

Required:

- Project name.
- Project country.
- Project boundary polygon.
- Baseline period.
- Monitoring period.
- Ecosystem type.
- Intended alignment: CCB, SD VISta, Nature Framework support, corporate reporting, or other.

Optional:

- Field polygons.
- Treatment/control polygons.
- Reference habitat polygons.
- Community polygons.
- Intervention dates.
- Crop/land-use classes.
- Project records.
- Ecological survey data.
- Livelihood survey data.

## 8.3 Accepted File Formats

The MVP should support:

1. GeoJSON.
2. Zipped Shapefile.
3. KML/KMZ.
4. CSV with WKT geometry.
5. CSV with latitude/longitude points for community/project sites.

## 8.4 Geometry QA/QC Checks

Every uploaded geometry should be checked for:

1. Valid geometry.
2. Self-intersections.
3. Empty geometry.
4. Duplicate polygons.
5. Duplicate IDs.
6. Overlapping polygons within same unit type.
7. Extremely small polygons.
8. Multi-part geometry handling.
9. CRS conversion to WGS84.
10. Area calculation consistency.
11. Geometry location sanity check against selected country.
12. Geometry complexity that may cause GEE processing failures.

## 8.5 Calculations

### Area

```text
area_ha = geometry.area(maxError) / 10,000
```

### Perimeter

```text
perimeter_m = geometry.perimeter(maxError)
```

### Compactness

```text
compactness = 4π × area_m² / perimeter_m²
```

Interpretation:

- 1.0 = compact circle.
- Lower values = elongated or irregular polygon.

### Standard Buffers

Generate standard buffers:

- 50 m.
- 100 m.
- 250 m.
- 500 m.
- 1 km.
- 5 km.

Buffers are used for surface-water context, riparian metrics, connectivity, community exposure, and nearby habitat context.

## 8.6 Outputs

- Uploaded geometry layer.
- Geometry QA report.
- Project and spatial-unit records.
- Area and perimeter metrics.
- Standard buffer layers.

---

# 9. Module 2 — Baseline Period Builder

## 9.1 Purpose

Create comparable baseline and monitoring periods.

## 9.2 Supported Period Types

The platform should support:

1. Fixed baseline period, e.g., 2019–2021.
2. Fixed monitoring period, e.g., 2024–2025.
3. Rolling baseline, e.g., prior 5 years.
4. Annual reporting.
5. Seasonal reporting.
6. Crop-season reporting.
7. Drought-year comparison.
8. Custom user-defined periods.

## 9.3 Output Periods

For every metric, generate:

- Baseline value.
- Monitoring value.
- Absolute change.
- Percent change.
- Trend direction.
- Confidence flag.

### Absolute Change

```text
absolute_change = monitoring_value - baseline_value
```

### Percent Change

```text
percent_change = (monitoring_value - baseline_value) / baseline_value × 100
```

If `baseline_value = 0`, use:

```text
percent_change = null
zero_baseline_flag = true
```

## 9.4 QA/QC Rules

- Monitoring period cannot occur before baseline period.
- Baseline period should meet minimum length configured by metric.
- Monitoring period must have sufficient imagery.
- Baseline and monitoring periods should use comparable seasons.
- Future dates should be rejected or warned.
- Drought-resilience metrics should only calculate if drought observations exist.

---

# 10. Module 3 — Habitat Extent

## 10.1 Purpose

Quantify how much natural, semi-natural, restored, or degraded habitat exists in the project area.

## 10.2 Inputs

- Project boundary.
- Field or habitat polygons.
- ESA WorldCover.
- CORINE Land Cover or uploaded European land-cover layer.
- Sentinel-2 classification if custom habitat classification is implemented.
- JRC surface water.
- User-defined habitat class mapping.

## 10.3 Required User Configuration

Users must map land-cover classes to platform habitat categories.

Example mapping:

| Source Class | Platform Habitat Class |
|---|---|
| Tree cover | Forest habitat |
| Grassland | Grassland habitat |
| Shrubland | Shrubland habitat |
| Cropland | Managed agricultural land |
| Built-up | Non-habitat |
| Permanent water | Aquatic habitat |
| Herbaceous wetland | Wetland habitat |

## 10.4 Calculations

### Habitat Area

```text
habitat_area_ha = sum(pixel_area where habitat_class in eligible_habitat_classes) / 10,000
```

### Natural / Semi-Natural Habitat Share

```text
habitat_share_pct = habitat_area_ha / total_project_area_ha × 100
```

### Habitat Change

```text
habitat_extent_change_ha = monitoring_habitat_area_ha - baseline_habitat_area_ha
```

### Habitat Loss

```text
habitat_loss_ha = baseline_habitat_area_ha - monitoring_habitat_area_ha
where land cover changed from habitat to non-habitat
```

### Restored Habitat

```text
restored_habitat_ha = monitoring_habitat_area_ha - baseline_habitat_area_ha
where land cover changed from non-habitat to habitat
```

## 10.5 Outputs

- Total area, ha.
- Habitat area, ha.
- Habitat share, percent.
- Forest habitat, ha.
- Grassland habitat, ha.
- Wetland habitat, ha.
- Riparian habitat, ha.
- Agricultural area, ha.
- Built or non-habitat area, ha.
- Habitat gain, ha.
- Habitat loss, ha.
- Net habitat change, ha.

## 10.6 Summary Visuals

1. Habitat class map.
2. Baseline vs monitoring habitat map.
3. Habitat change map.
4. Stacked bar chart of habitat classes.
5. KPI card: total habitat area.
6. KPI card: habitat gain/loss.
7. Table ranking spatial units by habitat change.

## 10.7 QA/QC Rules

- Habitat area cannot exceed total project area.
- Habitat share cannot exceed 100%.
- Land-cover class mapping must be confirmed by user.
- Mixed pixels or narrow habitat strips should receive a resolution warning.
- If land-cover datasets are too old for baseline/monitoring period, flag with temporal mismatch warning.

---

# 11. Module 4 — Habitat Condition

## 11.1 Purpose

Estimate habitat quality/condition using vegetation productivity, moisture, disturbance, bare soil, and reference-condition comparison.

## 11.2 Inputs

- Sentinel-2 Surface Reflectance Harmonized.
- Landsat Collection 2 fallback or long-term trend layer.
- ESA WorldCover / CORINE habitat mask.
- TerraClimate.
- Optional user-provided reference areas.
- Optional field survey calibration data.

## 11.3 Spectral Indices

### NDVI

```text
NDVI = (NIR - Red) / (NIR + Red)
```

Sentinel-2:

```text
NDVI = (B8 - B4) / (B8 + B4)
```

### EVI

```text
EVI = 2.5 × (NIR - Red) / (NIR + 6 × Red - 7.5 × Blue + 1)
```

Sentinel-2:

```text
EVI = 2.5 × (B8 - B4) / (B8 + 6 × B4 - 7.5 × B2 + 1)
```

### NDMI

```text
NDMI = (NIR - SWIR1) / (NIR + SWIR1)
```

Sentinel-2:

```text
NDMI = (B8 - B11) / (B8 + B11)
```

### Bare Soil Index

```text
BSI = ((SWIR1 + Red) - (NIR + Blue)) / ((SWIR1 + Red) + (NIR + Blue))
```

Sentinel-2:

```text
BSI = ((B11 + B4) - (B8 + B2)) / ((B11 + B4) + (B8 + B2))
```

## 11.4 Core Condition Metrics

### Vegetation Productivity Score

For each reporting period:

```text
ndvi_integral = sum(monthly_median_ndvi during growing season)
```

Normalize:

```text
productivity_score = percentile_rank(ndvi_integral against local reference distribution) × 100
```

### Vegetation Moisture Score

```text
moisture_score = percentile_rank(mean_growing_season_ndmi against local reference distribution) × 100
```

### Bare-Soil Frequency

```text
bare_soil_frequency = count(clear_observations where BSI > threshold and NDVI < threshold) / total_clear_observations
```

Suggested default thresholds:

```text
BSI > 0.10
NDVI < 0.25
```

Thresholds should be configurable by ecosystem type and region.

### Bare-Soil Score

```text
bare_soil_score = 100 × (1 - bare_soil_frequency)
```

### Disturbance Event

```text
disturbance_event = NDVI_current_month < NDVI_previous_month - 0.25
AND NDVI_current_month < historical_monthly_percentile_20
```

### Disturbance Frequency

```text
disturbance_frequency = count(disturbance_event months) / total_months
```

### Disturbance Score

```text
disturbance_score = 100 × (1 - disturbance_frequency)
```

### Reference-Condition Comparison

If reference areas are supplied:

```text
reference_gap = 1 - (project_condition_metric / reference_condition_metric)
```

```text
reference_similarity_score = min(100, project_condition_metric / reference_condition_metric × 100)
```

If no reference areas are supplied, use candidate reference pixels:

- Nearby same-ecosystem pixels.
- Same ecoregion or climate zone.
- Outside project boundary.
- Low recent disturbance.
- Similar slope/elevation where relevant.

## 11.5 Habitat Condition Score

Default MVP formula:

```text
Habitat Condition Score =
  0.30 × productivity_score
+ 0.20 × moisture_score
+ 0.20 × bare_soil_score
+ 0.15 × disturbance_score
+ 0.15 × reference_similarity_score
```

Score range:

- 0 = very poor condition.
- 100 = high condition.

## 11.6 Ecosystem-Specific Weighting

| Ecosystem | Weighting Adjustment |
|---|---|
| Forest | Increase disturbance and moisture weights; add canopy/structure if available. |
| Grassland | Increase productivity stability and bare-soil weights. |
| Cropland edge/agroecology | Increase winter cover, bare soil, and moisture weights. |
| Wetland/riparian | Increase NDMI, surface water, and seasonality weights. |
| Mediterranean dryland | Avoid penalizing normal seasonal senescence; use same-month percentiles. |

## 11.7 Outputs

- Baseline condition score.
- Monitoring condition score.
- Condition change.
- NDVI integral baseline.
- NDVI integral monitoring.
- NDMI mean baseline.
- NDMI mean monitoring.
- Bare-soil frequency baseline.
- Bare-soil frequency monitoring.
- Disturbance frequency.
- Reference similarity score.
- Condition confidence flag.

## 11.8 Summary Visuals

1. Habitat condition heat map.
2. Baseline vs monitoring condition map.
3. Condition change map.
4. NDVI time-series chart.
5. NDMI time-series chart.
6. Bare-soil frequency map.
7. Field/project condition ranking table.

## 11.9 QA/QC Rules

- NDVI must remain within expected range, typically -1 to 1.
- EVI outliers should be flagged.
- Low clear-observation count should reduce confidence.
- Seasonal senescence should not be treated automatically as disturbance.
- Snow/water/cloud artifacts must be masked or flagged.
- Condition score must be 0–100.
- Reference comparison should be flagged if reference area is missing or weak.

---

# 12. Module 5 — Connectivity and Fragmentation

## 12.1 Purpose

Quantify whether the project improves habitat connectivity, reduces fragmentation, or protects core habitat.

## 12.2 Inputs

- Habitat classification raster.
- Project boundary.
- Buffer zones.
- JRC surface water for riparian corridors.
- Optional Natura 2000 / protected areas.
- Optional roads / barriers.

## 12.3 Calculations

### Binary Habitat Raster

```text
habitat_pixel = 1 if class in eligible habitat classes
habitat_pixel = 0 otherwise
```

### Patch Identification

Use connected-component analysis to identify contiguous habitat patches.

### Patch Area

```text
patch_area_ha = connected_patch_pixel_count × pixel_area / 10,000
```

### Mean Patch Size

```text
mean_patch_size_ha = mean(patch_area_ha)
```

### Largest Patch Index

```text
largest_patch_index = largest_patch_area_ha / total_habitat_area_ha × 100
```

### Edge Density

```text
edge_density = total_habitat_edge_m / total_area_ha
```

### Core Habitat

Default edge buffer:

```text
edge_buffer = 30 m or 50 m
```

```text
core_habitat_area_ha = habitat_area farther than edge_buffer from non-habitat
```

### Distance to Nearest Habitat

```text
distance_to_habitat_m = distance from each non-habitat pixel to nearest habitat pixel
```

For each spatial unit:

```text
mean_distance_to_habitat_m
median_distance_to_habitat_m
```

### Connectivity Score

Default formula:

```text
Connectivity Score =
  0.30 × normalized_core_habitat_share
+ 0.25 × normalized_largest_patch_index
+ 0.20 × normalized_inverse_edge_density
+ 0.15 × normalized_inverse_distance_to_habitat
+ 0.10 × riparian_corridor_continuity_score
```

## 12.4 Outputs

- Patch count.
- Mean patch size, ha.
- Largest patch area, ha.
- Largest patch index.
- Edge density.
- Core habitat area, ha.
- Core habitat share, percent.
- Mean distance to habitat, m.
- Riparian corridor continuity score.
- Connectivity score.
- Connectivity change.

## 12.5 Summary Visuals

1. Habitat patch map.
2. Core habitat map.
3. Connectivity corridor map.
4. Distance-to-habitat raster.
5. Patch size histogram.
6. Connectivity score KPI.

## 12.6 QA/QC Rules

- Connectivity metrics require a habitat raster.
- Very small polygons may not support meaningful patch metrics.
- Narrow corridors below dataset resolution must be flagged.
- Edge density should not be calculated on invalid or extremely small geometries.
- If roads/barriers are not included, connectivity should be labeled as land-cover connectivity, not functional species connectivity.

---

# 13. Module 6 — Water-Risk and Drought-Resilience

## 13.1 Purpose

Quantify whether the project is located in a water-risk area and whether vegetation indicators show resilience under drought stress.

This module is relevant to:

1. Ecosystem-service co-benefits.
2. Livelihood resilience.
3. Drought adaptation.
4. Water-related corporate sustainability claims.
5. CCB community/biodiversity risk context.

## 13.2 Inputs

- WRI Aqueduct v4.
- TerraClimate.
- SPEIbase.
- JRC Global Surface Water.
- Sentinel-2.
- Project boundary.
- Reference areas.

## 13.3 WRI Aqueduct Metrics

For each field/project polygon, spatially join to Aqueduct.

Preferred join hierarchy:

1. Largest-overlap Aqueduct polygon.
2. Centroid match if overlap is ambiguous.
3. Area-weighted average if polygon spans multiple Aqueduct units.

Output metrics:

- WRI overall water risk score.
- WRI baseline water stress score.
- WRI baseline water depletion score.
- WRI drought risk score.
- WRI seasonal variability score.
- WRI interannual variability score.

## 13.4 TerraClimate Metrics

Recommended variables:

- `pr` = precipitation.
- `pet` = potential evapotranspiration.
- `aet` = actual evapotranspiration.
- `def` = climatic water deficit.
- `soil` = soil moisture.
- `ro` = runoff.
- `pdsi` = Palmer drought severity index.

Calculations:

```text
annual_precip_mm = sum(pr over year)
annual_pet_mm = sum(pet over year)
annual_deficit_mm = sum(def over year)
pet_pr_ratio = annual_pet_mm / annual_precip_mm
soil_moisture_mean = mean(soil over period)
pdsi_min = min(pdsi over growing season)
```

### Deficit Percentile

For each pixel or spatial unit:

```text
deficit_percentile = percentile_rank(current_period_deficit against historical same-period deficit)
```

Recommended historical baseline:

- Last 20 years where available, or
- 2001–2020.

## 13.5 SPEI Drought Metrics

Recommended time scales:

- SPEI-3 = seasonal drought.
- SPEI-6 = growing-season/semiannual drought.
- SPEI-12 = annual hydrologic drought.

Metrics:

- SPEI-3 growing-season mean.
- SPEI-3 growing-season minimum.
- SPEI-6 annual mean.
- Months with SPEI < -1.0.
- Months with SPEI < -1.5.
- Months with SPEI < -2.0.

Interpretation:

| SPEI | Class |
|---:|---|
| > -0.5 | Normal |
| -0.5 to -1.0 | Mild drought |
| -1.0 to -1.5 | Moderate drought |
| -1.5 to -2.0 | Severe drought |
| < -2.0 | Extreme drought |

## 13.6 Surface-Water Context Metrics

Use JRC Global Surface Water within buffers.

Metrics:

- Surface-water occurrence mean within 1 km.
- Surface-water occurrence mean within 5 km.
- Permanent water area within 1 km, ha.
- Permanent water area within 5 km, ha.
- Seasonal water area within 1 km, ha.
- Seasonal water area within 5 km, ha.
- Surface-water loss area within 5 km, ha.
- Distance to persistent water, m.

## 13.7 Vegetation Drought-Resilience Score

This is one of the most important MVP metrics.

### Step 1 — Identify Drought Periods

A month is drought-stressed if:

```text
SPEI-3 < -1.0
or TerraClimate deficit percentile > 80th percentile
or PDSI below configured threshold
```

### Step 2 — Calculate Vegetation Performance During Drought

```text
drought_ndvi = mean(NDVI during drought months)
normal_ndvi = mean(NDVI during non-drought months)
```

```text
vegetation_drought_retention = drought_ndvi / normal_ndvi
```

### Step 3 — Compare Project to Reference

```text
project_retention = project_drought_ndvi / project_normal_ndvi
reference_retention = reference_drought_ndvi / reference_normal_ndvi
```

```text
relative_resilience = project_retention - reference_retention
```

### Step 4 — Convert to Score

```text
Vegetation Drought Resilience Score = normalize(relative_resilience, lower_bound=-0.20, upper_bound=0.20) × 100
```

Interpretation:

- 0 = project performs much worse than reference.
- 50 = project performs similarly to reference.
- 100 = project performs much better than reference.

## 13.8 Outputs

- Water risk class.
- Drought exposure score.
- Climatic water deficit score.
- Surface water context score.
- Vegetation drought resilience score.
- Water resilience summary score.

## 13.9 Summary Visuals

1. WRI water-risk map.
2. Climatic water deficit map.
3. SPEI drought time-series.
4. Surface-water occurrence map.
5. Drought-period NDVI comparison chart.
6. Project vs reference vegetation resilience chart.

## 13.10 QA/QC Rules

- WRI join method must be documented.
- If field spans multiple WRI polygons, flag and report area-weighted and highest-risk values.
- SPEI is coarse and should be labeled as regional drought context.
- If no drought months exist, do not calculate drought-resilience score.
- Surface-water metrics near coasts should distinguish coastal water from inland water where possible.
- Water-risk class does not prove field-level water use or water impact.

---

# 14. Module 7 — Land Degradation and Erosion-Pressure Proxy

## 14.1 Purpose

Quantify spatial indicators of land degradation risk, erosion pressure, and soil-cover improvement.

This is relevant to:

1. Biodiversity condition.
2. Agricultural livelihood resilience.
3. Water-quality co-benefits.
4. Soil-health co-benefits.
5. CCB community/biodiversity risk monitoring.

## 14.2 Inputs

- Sentinel-2 NDVI, BSI, NDMI.
- DEM slope.
- TerraClimate precipitation.
- Land-cover class.
- Optional soil erodibility layer.
- Optional rainfall erosivity layer.

## 14.3 Core Calculations

### Bare-Soil Frequency

```text
bare_soil_frequency = clear_observations_with_bare_soil / total_clear_observations
```

### Slope Score

```text
slope_score = normalize(mean_slope_degrees, lower_bound=0, upper_bound=15)
```

### Rainfall Pressure

Use TerraClimate precipitation intensity proxy:

```text
rainfall_pressure = percentile_rank(max_monthly_precip against historical distribution)
```

### Erosion-Pressure Proxy

MVP formula:

```text
Erosion Pressure Proxy =
  0.45 × bare_soil_frequency_score
+ 0.35 × slope_score
+ 0.20 × rainfall_pressure_score
```

Higher score means higher erosion pressure.

### Soil-Cover Improvement

```text
soil_cover_improvement = baseline_bare_soil_frequency - monitoring_bare_soil_frequency
```

Positive values indicate improvement.

## 14.4 Outputs

- Bare-soil frequency.
- Mean slope.
- Rainfall pressure score.
- Erosion-pressure proxy.
- Soil-cover improvement.
- Degradation risk class.

## 14.5 Summary Visuals

1. Bare-soil frequency map.
2. Slope map.
3. Erosion-pressure heat map.
4. Soil-cover improvement map.
5. High-risk field table.

## 14.6 QA/QC Rules

- Erosion-pressure proxy must be labeled as a proxy, not measured erosion.
- High slope + bare soil should trigger high-risk warning.
- If rainfall data is missing or coarse, flag reduced confidence.
- For very flat areas, erosion-pressure score should not be dominated by slope.
- For snow-covered months, bare-soil classification should be masked or excluded.

---

# 15. Module 8 — Community and Livelihood-Support Module

## 15.1 Purpose

Capture and organize livelihood and community indicators relevant to CCB or SD VISta that cannot be measured from satellite data alone.

The platform should separate:

1. GEE-calculated livelihood-support proxies.
2. Project-entered direct livelihood metrics.

## 15.2 GEE-Calculated Livelihood-Support Proxies

| Theme | Metric |
|---|---|
| Agricultural resilience | Vegetation productivity stability. |
| Drought exposure | Drought frequency and severity. |
| Water risk | Aqueduct risk class. |
| Land degradation | Erosion-pressure proxy. |
| Surface-water context | Distance to persistent water. |
| Ecosystem service access | Distance to habitat, water, forest, grassland. |
| Productivity stability | NDVI integral coefficient of variation. |
| Recovery after shock | Post-drought NDVI recovery time. |

## 15.3 Project-Entered Direct Livelihood Indicators

Required MVP fields:

- Number of participating households.
- Number of participating farms.
- Hectares enrolled.
- Payments to participants.
- Jobs created.
- Training events.
- Participants trained.
- Grievances received.
- Grievances resolved.
- Stakeholder consultation events.
- Benefit-sharing description.
- Negative impact mitigation actions.

Optional fields:

- Income change.
- Yield change.
- Food security survey score.
- Water access survey score.
- Gender or youth participation metrics, where voluntarily collected and appropriate.
- Local procurement value.
- Community investment value.

Sensitive data should be optional, consent-based, and configurable.

## 15.4 Livelihood-Support Evidence Score

Do not call this “livelihood impact” unless direct survey or outcome data exists.

Recommended name:

```text
Livelihood Support Evidence Score
```

Formula:

```text
Livelihood Support Evidence Score =
  0.30 × participation_score
+ 0.20 × benefit_sharing_score
+ 0.20 × training_or_capacity_score
+ 0.15 × resilience_proxy_score
+ 0.15 × grievance_resolution_score
```

### Participation Score

```text
participation_score = normalize(number_of_participating_households_or_farms against project target)
```

### Benefit-Sharing Score

```text
benefit_sharing_score = normalize(payments_to_participants_or_benefits_delivered against project target)
```

### Resilience Proxy Score

```text
resilience_proxy_score = average(
  vegetation_drought_resilience_score,
  inverse_erosion_pressure_score,
  productivity_stability_score
)
```

### Grievance Resolution Rate

```text
grievance_resolution_rate = grievances_resolved / grievances_received
```

If `grievances_received = 0`, output:

```text
grievance_resolution_rate = null
no_grievances_reported_flag = true
```

## 15.5 Outputs

- Participating households.
- Participating farms.
- Payments to participants.
- Jobs created.
- Participants trained.
- Grievance resolution rate.
- Agricultural resilience proxy.
- Livelihood support evidence score.
- Community data completeness score.

## 15.6 Summary Visuals

1. Community / stakeholder area map.
2. Participation KPI cards.
3. Benefit-sharing chart.
4. Training/event timeline.
5. Livelihood-support evidence score.
6. Grievance status table.
7. Spatial risk + community exposure overlay.

## 15.7 QA/QC Rules

- Livelihood claims require project-entered or survey evidence.
- Satellite proxies alone cannot support “livelihood improved” claims.
- Benefit-sharing metrics should require evidence files or notes.
- Missing grievance mechanism should trigger warning.
- Sensitive demographic indicators should be optional and handled carefully.
- Zero grievances should not be automatically scored as positive unless grievance mechanism exists.

---

# 16. Module 9 — Evidence Export and Verra Alignment

## 16.1 Purpose

Generate structured outputs that can support Verra-aligned project documentation.

## 16.2 Export Types

1. CSV field/project metric table.
2. GeoJSON metric layer.
3. Shapefile export.
4. Map images.
5. PDF report.
6. DOCX report.
7. Methods appendix.
8. QA/QC exception report.
9. Dataset citation table.
10. Verra alignment crosswalk.

## 16.3 Required Report Sections

1. Executive summary.
2. Project boundary and monitoring period.
3. Dataset inventory.
4. Methods summary.
5. Habitat extent results.
6. Habitat condition results.
7. Connectivity results.
8. Water-risk and drought-resilience results.
9. Land degradation / erosion-pressure results.
10. Community/livelihood-support indicators.
11. QA/QC results.
12. Limitations and claim boundaries.
13. Verra alignment crosswalk.
14. Appendix: raw metrics.
15. Appendix: maps.

## 16.4 Verra Alignment Crosswalk

| Platform Output | CCB Relevance | SD VISta Relevance | Nature Framework Relevance |
|---|---|---|---|
| Habitat extent | Biodiversity net benefit evidence | Sustainable land/nature claim | Extent component |
| Habitat condition score | Biodiversity monitoring | Measured environmental benefit | Condition component |
| Habitat change | Net benefit / impact monitoring | Before-after claim | Outcome change |
| Connectivity score | Biodiversity landscape benefit | Ecosystem service claim | Supporting biodiversity context |
| Water-risk class | Community and ecosystem risk context | Water/security claim context | Resilience context |
| Drought resilience | Adaptation / resilience evidence | Resilience claim | Supporting condition metric |
| Erosion-pressure proxy | Community/biodiversity risk | Soil/water co-benefit claim | Pressure reduction |
| Livelihood records | Community benefit evidence | Sustainable-development claim | Contextual, not primary |
| Grievance records | Safeguards evidence | Stakeholder process evidence | Safeguards |

## 16.5 Claim Language Guardrails

### Allowed with GEE-only evidence

- “The project area showed improved vegetation condition indicators.”
- “The project area is located in a high water-risk region according to WRI Aqueduct.”
- “Mapped habitat extent increased by X ha based on the selected land-cover classification.”
- “Bare-soil exposure declined by X percentage points based on Sentinel-2 index thresholds.”

### Not allowed without additional evidence

- “The project increased species richness.”
- “The project improved household income.”
- “The project generated verified biodiversity credits.”
- “The project caused water replenishment.”
- “The project produced certified CCB benefits.”

---

# 17. Overall Scoring Framework

## 17.1 Component Scores

The platform should produce component scores, not only one black-box score.

Component scores:

1. Habitat Extent Score.
2. Habitat Condition Score.
3. Connectivity Score.
4. Water & Drought Resilience Score.
5. Land Degradation / Erosion Pressure Score.
6. Livelihood Support Evidence Score.

## 17.2 Overall Co-Benefit Score

Default MVP formula:

```text
Overall Co-benefit Score =
  0.25 × Habitat Extent Score
+ 0.25 × Habitat Condition Score
+ 0.15 × Connectivity Score
+ 0.15 × Water & Drought Resilience Score
+ 0.10 × Inverse Erosion Pressure Score
+ 0.10 × Livelihood Support Evidence Score
```

## 17.3 Score Classes

| Score | Class |
|---:|---|
| 0–20 | Very low |
| 20–40 | Low |
| 40–60 | Moderate |
| 60–80 | High |
| 80–100 | Very high |

## 17.4 Trend Classification

```text
Improving: monitoring_score - baseline_score >= +5
Stable: -5 < change < +5
Declining: monitoring_score - baseline_score <= -5
```

Thresholds should be configurable.

## 17.5 Raw Metric Preservation

Every score must preserve:

- Raw input values.
- Weights used.
- Thresholds used.
- Dataset versions.
- Method version.
- QA flags.
- Calculation timestamp.

---

# 18. Dashboard Design

## 18.1 Project Overview Dashboard

### KPI Cards

- Project area.
- Number of fields / spatial units.
- Habitat area.
- Habitat condition score.
- Connectivity score.
- Water-risk class.
- Drought-resilience score.
- Livelihood-support evidence score.
- Overall co-benefit score.
- QA warnings.

### Visuals

1. Project map.
2. Score radar chart.
3. Baseline vs monitoring score comparison.
4. QA warning panel.
5. Export button.

## 18.2 Habitat Dashboard

1. Habitat extent map.
2. Habitat class breakdown.
3. Habitat gain/loss chart.
4. Habitat condition heat map.
5. NDVI/NDMI time-series.
6. Top improving / declining units.

## 18.3 Connectivity Dashboard

1. Patch map.
2. Core habitat map.
3. Distance-to-habitat map.
4. Connectivity score by field/project.
5. Fragmentation summary.

## 18.4 Water and Resilience Dashboard

1. WRI Aqueduct risk overlay.
2. TerraClimate deficit map.
3. SPEI drought chart.
4. JRC surface-water context map.
5. Drought-period vegetation performance chart.
6. Project vs reference resilience chart.

## 18.5 Community/Livelihood Dashboard

1. Community areas map.
2. Participating farms/households.
3. Benefit-sharing records.
4. Training and capacity-building chart.
5. Grievance status table.
6. Livelihood-support evidence score.
7. Data completeness warnings.

## 18.6 QA/QC Dashboard

1. Geometry validation errors.
2. Cloud coverage warnings.
3. Missing data warnings.
4. Outlier metrics.
5. Baseline/monitoring mismatch flags.
6. Low-confidence classification areas.
7. Manual review queue.

---

# 19. QA/QC Framework

## 19.1 Geometry QA Tests

| Test | Expected Behavior |
|---|---|
| Valid polygon upload | Accept and calculate area. |
| Self-intersecting polygon | Reject or auto-fix with warning. |
| Empty geometry | Reject. |
| Duplicate field ID | Flag and require correction. |
| Overlapping fields | Warn user. |
| Geometry outside selected country | Warn user. |
| CRS not WGS84 | Reproject and log. |
| Tiny polygon below threshold | Warn user. |
| MultiPolygon | Accept and preserve parts. |

## 19.2 Time-Period QA Tests

| Test | Expected Behavior |
|---|---|
| Monitoring period before baseline | Reject. |
| Baseline shorter than minimum | Warn. |
| Monitoring period has no imagery | Warn. |
| Baseline and monitoring periods use different seasons | Warn. |
| Future dates selected | Reject or warn. |
| Drought-resilience metric with no drought months | Return “insufficient drought observations.” |

## 19.3 Remote-Sensing QA Tests

| Test | Expected Behavior |
|---|---|
| High cloud cover | Flag low confidence. |
| Too few Sentinel-2 observations | Use Landsat fallback or warn. |
| Snow contamination | Mask snow or warn. |
| Water pixels inside field | Mask or classify separately. |
| Seasonal senescence misclassified as disturbance | Use same-month historical percentiles. |
| Low observation count in winter | Flag cover/bare-soil metrics as low confidence. |
| Negative or impossible index values | Check band scaling and masks. |

## 19.4 Dataset QA Tests

| Test | Expected Behavior |
|---|---|
| Missing WRI Aqueduct overlap | Use centroid nearest polygon and warn. |
| Field spans multiple Aqueduct polygons | Use largest-overlap or area-weighted result. |
| TerraClimate no-data pixels | Warn and exclude. |
| SPEI coarse resolution issue | Flag “regional only.” |
| JRC surface water near coast | Distinguish coastal water vs inland water where possible. |
| Land-cover class mismatch | Require user class mapping approval. |

## 19.5 Metric QA Tests

| Test | Expected Behavior |
|---|---|
| Habitat area exceeds project area | Fail. |
| Habitat share > 100% | Fail. |
| Condition score outside 0–100 | Fail. |
| Percent change with zero baseline | Return null and flag. |
| Extremely high NDVI value | Check scaling. |
| Bare-soil frequency > 1 | Fail. |
| Connectivity score missing components | Partial score with warning. |
| Livelihood score without project records | Show “incomplete,” not zero impact. |

## 19.6 Report QA Tests

| Test | Expected Behavior |
|---|---|
| Missing dataset citation | Fail export. |
| Missing methods version | Fail export. |
| Missing project boundary map | Fail export. |
| High QA warning count | Require user acknowledgment. |
| Claim language too strong | Show warning. |
| “Biodiversity increased” without species/condition evidence | Suggest safer claim. |
| “Livelihood improved” without survey/project records | Suggest safer claim. |

---

# 20. Test Use Cases

## 20.1 Use Case 1 — Spanish Dryland Agriculture Project

### Scenario

A regenerative agriculture project in Spain wants to show improved soil cover, water-risk context, and biodiversity co-benefit potential.

### Expected Platform Behavior

1. WRI shows medium-high or high water-risk context.
2. TerraClimate shows high climatic water deficit.
3. SPEI identifies drought years.
4. Sentinel-2 shows winter cover or reduced bare soil if practices are present.
5. Erosion-pressure proxy decreases if bare soil decreases.
6. Drought-resilience score improves if NDVI retention improves relative to reference fields.

### QA Checks

1. Avoid penalizing normal Mediterranean summer senescence.
2. Use same-month comparisons.
3. Flag low winter observation count if cloudy.
4. Require project records before claiming livelihood improvement.

## 20.2 Use Case 2 — Romanian Mixed Cropland / Grassland Project

### Scenario

A project includes cropland, grassland, and field margins.

### Expected Platform Behavior

1. Habitat classification separates cropland from semi-natural grassland.
2. Connectivity module identifies field margins and patches.
3. Habitat condition score differs by ecosystem class.
4. Cropland areas do not get scored against forest reference condition.

### QA Checks

1. Ecosystem-specific scoring must be applied.
2. Habitat class mapping must be reviewed.
3. Mixed pixels and small field margins should be flagged for resolution limits.

## 20.3 Use Case 3 — Riparian Restoration Project in France

### Scenario

A project restores riparian vegetation along streams.

### Expected Platform Behavior

1. Buffer analysis calculates riparian vegetation extent.
2. JRC identifies nearby surface-water occurrence.
3. NDVI/NDMI condition improves in riparian buffers.
4. Connectivity score improves along the corridor.

### QA Checks

1. Surface water should not be mistaken for vegetation.
2. Riparian buffer width should be configurable.
3. Seasonal water should be classified separately from permanent water.

## 20.4 Use Case 4 — Corporate Project with Community Benefits

### Scenario

A company wants to report biodiversity and livelihood-support co-benefits.

### Expected Platform Behavior

1. GEE calculates habitat, water, resilience, and erosion metrics.
2. User enters participation, payment, training, and grievance data.
3. Platform produces livelihood-support evidence score.
4. Report separates satellite proxies from project-entered community outcomes.

### QA Checks

1. Do not allow “livelihood improved” claim without direct data.
2. Require evidence files for project-entered claims.
3. Flag missing grievance mechanism data.

## 20.5 Use Case 5 — Field Crosses Multiple WRI Aqueduct Polygons

### Scenario

A large project area intersects multiple water-risk units.

### Expected Platform Behavior

1. Platform calculates area-weighted WRI risk.
2. Also reports highest-risk intersecting class.
3. Flags boundary-crossing condition.

### QA Checks

1. Area-weighted result sums to 100% area.
2. Largest-overlap result is preserved.
3. Report explains method used.

## 20.6 Use Case 6 — No Drought Years in Monitoring Period

### Scenario

The user requests drought-resilience score, but no drought months occurred.

### Expected Platform Behavior

1. Platform does not force a resilience score.
2. It reports “insufficient drought observations.”
3. It may calculate water-risk exposure but not drought response.

### QA Checks

1. No fake zero score.
2. No improvement claim generated.
3. Report explains limitation.

## 20.7 Use Case 7 — Cloudy Region with Insufficient Sentinel-2

### Scenario

Northern Europe project has limited clear imagery.

### Expected Platform Behavior

1. Platform flags low observation count.
2. Uses seasonal composites.
3. Uses Landsat fallback where appropriate.
4. Assigns lower confidence to spectral metrics.

### QA Checks

1. Observation count visible in output.
2. Confidence flag included for every metric.
3. No unsupported fine-scale claim.

## 20.8 Use Case 8 — Community/Livelihood Data Missing

### Scenario

A project has strong GEE-derived biodiversity metrics but has not entered participation or benefit-sharing data.

### Expected Platform Behavior

1. Biodiversity and ecosystem metrics calculate normally.
2. Livelihood-support evidence score is incomplete or low-confidence.
3. Report prevents unsupported livelihood-improvement language.
4. QA dashboard lists missing community data fields.

### QA Checks

1. Missing livelihood records should not be treated as zero livelihood benefit.
2. Report language must distinguish ecosystem evidence from community evidence.
3. Export must include data-completeness score.

---

# 21. Development Timeline

## Phase 0 — Technical Discovery, 1–2 Weeks

Deliverables:

1. Confirm GEE authentication model.
2. Confirm cloud architecture.
3. Confirm input file formats.
4. Confirm first target countries/ecosystems.
5. Finalize MVP metrics.
6. Create mock data model.
7. Build one GEE proof-of-concept script.
8. Confirm report export approach.

Exit criteria:

1. Developers can authenticate to GEE.
2. Developers can process one test polygon.
3. Developers can return at least one raster-derived metric and one vector overlay metric.

## Phase 1 — MVP Geospatial Engine, 4–6 Weeks

Build:

1. Project creation.
2. Boundary upload.
3. Geometry QA.
4. Sentinel-2 cloud-masked composites.
5. ESA WorldCover habitat extent.
6. WRI Aqueduct join.
7. TerraClimate water-deficit metrics.
8. JRC surface-water context.
9. Basic metric export CSV.

Exit criteria:

1. User can upload project boundary.
2. Platform returns field/project metrics.
3. All raw values are exportable.
4. QA warnings are stored.

## Phase 2 — Habitat Condition and Resilience, 4–6 Weeks

Build:

1. NDVI/EVI/NDMI/BSI time series.
2. Habitat condition score.
3. Bare-soil frequency.
4. Drought-period detection.
5. Vegetation drought-resilience score.
6. Baseline vs monitoring comparison.
7. Field/project ranking table.

Exit criteria:

1. Platform calculates baseline, monitoring, and change.
2. Metrics are repeatable.
3. Low-confidence observations are flagged.
4. Maps and charts render in dashboard.

## Phase 3 — Connectivity and Livelihood Module, 4–6 Weeks

Build:

1. Patch metrics.
2. Core habitat.
3. Edge density.
4. Distance-to-habitat.
5. Project-entered livelihood indicators.
6. Participation / benefit-sharing records.
7. Grievance record table.
8. Livelihood-support evidence score.

Exit criteria:

1. Connectivity metrics run on habitat raster.
2. Community records can be entered and edited.
3. Livelihood-support score separates GEE proxies from direct records.

## Phase 4 — Evidence Export and Verra Alignment, 3–5 Weeks

Build:

1. PDF report generator.
2. CSV/GeoJSON export.
3. Map export.
4. Dataset citation table.
5. Methods appendix.
6. QA/QC exception report.
7. Verra alignment crosswalk.
8. Safer claim language suggestions.

Exit criteria:

1. User can generate a project evidence package.
2. All metrics have dataset and method provenance.
3. Report includes limitations and QA flags.

## Phase 5 — Hardening and Pilot Testing, 4–8 Weeks

Build/test:

1. Pilot projects in 2–3 European contexts.
2. Performance optimization.
3. Manual review workflows.
4. Versioned calculations.
5. User permissions.
6. Audit logs.
7. Regression test suite.
8. Documentation.

Exit criteria:

1. Same inputs produce same outputs.
2. Metrics are versioned.
3. Developers can run automated test suite.
4. Pilot reports reviewed by domain experts.

---

# 22. MVP Feature Checklist

## 22.1 Must-Have

- Project creation.
- Boundary upload.
- Geometry QA.
- Baseline/monitoring period selection.
- Habitat extent calculation.
- Habitat condition score.
- Water-risk overlay.
- Drought/water-deficit metrics.
- Surface-water context.
- Bare-soil frequency.
- Basic resilience score.
- Community/livelihood data entry.
- CSV export.
- Map visualization.
- QA warnings.
- Methods documentation.

## 22.2 Should-Have

- Connectivity score.
- Reference area selection.
- Project vs reference comparison.
- PDF report export.
- Verra alignment crosswalk.
- Claim language suggestions.
- Manual review queue.
- Metric versioning.

## 22.3 Could-Have

- Species occurrence integration.
- Natura 2000 overlay.
- GBIF/IUCN import.
- eDNA/acoustic/camera-trap data upload.
- AI-generated report narrative.
- API for external platforms.
- Multi-project portfolio dashboard.

---

# 23. Recommended MVP Output Table

Each project/spatial unit should export:

```text
project_id
unit_id
unit_type
area_ha
country
ecosystem_type

baseline_habitat_area_ha
monitoring_habitat_area_ha
habitat_change_ha
habitat_share_pct

baseline_condition_score
monitoring_condition_score
condition_change
ndvi_integral_baseline
ndvi_integral_monitoring
ndmi_mean_baseline
ndmi_mean_monitoring
bare_soil_frequency_baseline
bare_soil_frequency_monitoring

patch_count
mean_patch_size_ha
core_habitat_area_ha
edge_density
connectivity_score

wri_overall_water_risk
wri_baseline_water_stress
wri_baseline_water_depletion
terraclimate_deficit_mean
spei3_min
surface_water_occurrence_5km
vegetation_drought_resilience_score

erosion_pressure_proxy
soil_cover_improvement

participating_households
participating_farms
payments_to_participants
participants_trained
grievance_resolution_rate
livelihood_support_evidence_score

overall_cobenefit_score
overall_trend_class
qa_status
qa_warning_count
manual_review_required
```

---

# 24. Recommended Report Language

## 24.1 Strong, Low-Risk Language

> The platform calculated spatial indicators relevant to biodiversity, ecosystem condition, water-risk exposure, and livelihood-support evidence.

> The project area showed an increase in mapped habitat extent of X hectares between the baseline and monitoring periods.

> Vegetation condition indicators improved by X points based on Sentinel-2 derived NDVI, NDMI, bare-soil frequency, and disturbance metrics.

> The project is located in an area classified by WRI Aqueduct as [risk class] for baseline water stress.

## 24.2 Avoid Unless Additional Data Exists

Avoid claims such as:

- The project increased species richness.
- The project improved household income.
- The project generated verified biodiversity credits.
- The project caused water replenishment.
- The project produced certified CCB benefits.

---

# 25. Initial Build Strategy for bolt.new

For the first bolt.new build, do not attempt to connect to live Google Earth Engine immediately. Build the product shell with mock metric data and a clean architecture that can later call backend/GEE services.

The first build should include:

1. Project creation wizard.
2. Boundary upload placeholder.
3. Mock map panel.
4. Dashboard with KPI cards.
5. Tabs for Habitat, Water/Resilience, Connectivity, Community, QA/QC, and Export.
6. Mock metric calculations from sample JSON.
7. Editable community/livelihood data forms.
8. QA warning table.
9. Export preview page.
10. Clear TODO interfaces for backend/GEE integration.

---

# 26. First Prompt for bolt.new

Use the prompt below as the initial build prompt.

```text
Build a production-quality MVP web app frontend for a Verra-aligned co-benefit, biodiversity, and resilience monitoring platform. Use React, TypeScript, Tailwind, and a clean component architecture. Do not connect to Google Earth Engine yet. Use mock data and clearly defined service interfaces so that a backend/GEE integration can be added later.

The app should help users create land-based sustainability projects and review co-benefit metrics that support CCB, SD VISta, Verra Nature Framework project development, and corporate sustainability reporting. The app must not claim to issue credits or certify outcomes.

Core screens:

1. Landing / Projects page
- Show list of projects.
- Create new project button.
- Project cards with status, country, ecosystem type, baseline period, monitoring period, overall co-benefit score, QA warning count.

2. Project creation wizard
- Step 1: project details: name, country, ecosystem type, intended alignment: CCB, SD VISta, Nature Framework support, Corporate.
- Step 2: baseline and monitoring period selection.
- Step 3: boundary upload placeholder supporting GeoJSON, zipped shapefile, KML/KMZ, CSV with WKT.
- Step 4: habitat class mapping placeholder.
- Step 5: review and create project.

3. Project dashboard
- KPI cards: project area, number of spatial units, habitat area, habitat condition score, connectivity score, water-risk class, drought-resilience score, livelihood-support evidence score, overall co-benefit score, QA warning count.
- Main map panel with mock layers and layer toggles.
- Score radar chart.
- Baseline vs monitoring comparison chart.
- QA warning summary panel.

4. Habitat tab
- Habitat extent map placeholder.
- Habitat class stacked bar chart.
- Habitat gain/loss chart.
- Habitat condition heat map placeholder.
- NDVI/NDMI mock time-series chart.
- Table of spatial units ranked by condition change.

5. Water & Resilience tab
- WRI water-risk class display.
- TerraClimate deficit chart.
- SPEI drought time-series chart.
- Surface-water context map placeholder.
- Drought-period vegetation performance chart.
- Project vs reference resilience comparison.

6. Connectivity tab
- Patch map placeholder.
- Patch metric cards: patch count, mean patch size, core habitat area, edge density, connectivity score.
- Patch size histogram.
- Distance-to-habitat mock visualization.

7. Community & Livelihood tab
- Forms for number of participating households, participating farms, hectares enrolled, payments to participants, jobs created, training events, participants trained, grievances received, grievances resolved, stakeholder consultation events, benefit-sharing description, negative-impact mitigation actions.
- Show livelihood-support evidence score.
- Show data-completeness score.
- Show warning that livelihood outcomes require project records/surveys and cannot be proven by satellite data alone.

8. QA/QC tab
- QA issue table with severity, issue type, message, recommended action, resolved status.
- Group QA issues by geometry, imagery, dataset, metric, report, claim language, user input.
- Include filters for pass/warning/fail.

9. Export tab
- Show export options: CSV, GeoJSON, PDF report, methods appendix, QA/QC exception report, Verra alignment crosswalk.
- Include report preview sections: executive summary, project boundary, dataset inventory, methods, habitat results, water/resilience results, connectivity results, community/livelihood indicators, QA/QC, limitations, Verra alignment crosswalk.

Mock data requirements:
- Include at least three sample projects: Spain dryland agriculture, Romania mixed cropland/grassland, France riparian restoration.
- Include mock spatial-unit metrics matching this schema: project_id, unit_id, area_ha, habitat_area_ha, habitat_change_ha, baseline_condition_score, monitoring_condition_score, condition_change, connectivity_score, water_risk_class, wri_baseline_water_stress, terraclimate_deficit_mean, spei3_min, vegetation_drought_resilience_score, erosion_pressure_proxy, livelihood_support_evidence_score, overall_cobenefit_score, qa_status, qa_warning_count.
- Include mock QA issues that demonstrate geometry warnings, cloud coverage warnings, missing livelihood data, and claim-language warnings.

Architecture requirements:
- Create a `/services` layer with placeholder functions such as createProject, uploadBoundary, runGeospatialMetrics, fetchProjectMetrics, fetchMapLayers, updateCommunityIndicators, generateEvidenceReport.
- Create a `/types` folder with TypeScript types for Project, SpatialUnit, MetricResult, QAIssue, CommunityIndicator, ReportExport.
- Use reusable components: KPICard, MapPanel, ScoreBadge, QAWarningPanel, MetricTable, TimeSeriesChart, RadarScoreChart, ExportCard, ProjectWizard.
- Make the UI polished, professional, and suitable for enterprise sustainability users.
- Use clear disclaimers in the app: “This platform generates co-benefit evidence and does not issue credits or certify outcomes.”
- Ensure the app is responsive and works on desktop and tablet.

Design style:
- Clean enterprise SaaS style.
- Nature/climate theme without looking cartoonish.
- Use cards, tabs, badges, and data tables.
- Prioritize clarity, auditability, and professional reporting.

Do not implement authentication yet. Do not implement live GEE integration yet. Create clear TODO comments where the backend/GEE integration will be added.
```

---

# 27. Future Backend/GEE Integration Prompt

Use this later, after the frontend shell is complete.

```text
Now add a backend integration plan and scaffold for Google Earth Engine metric calculations. Create backend service interfaces and API routes for boundary upload, geometry validation, GEE task creation, metric calculation, task status polling, metric persistence, map tile retrieval, and evidence report generation. Keep the existing mock data mode available as a fallback. Do not expose secrets in the frontend. Include clear configuration variables and placeholder server-side GEE authentication logic.
```

---

# 28. Final Build Guidance

The strongest MVP is a co-benefit evidence platform, not a crediting platform. It should combine:

1. GEE-derived evidence: habitat, vegetation condition, connectivity, water risk, drought resilience, surface water, bare soil, erosion pressure, and land-cover change.
2. Project-entered evidence: participation, benefit sharing, training, employment, grievances, stakeholder records, survey outcomes, and safeguards.
3. Audit-oriented outputs: raw metrics, methods, dataset versions, QA flags, limitations, and conservative report language.

This approach gives developers a realistic product scope and gives project teams a credible evidence package for CCB, SD VISta, Verra Nature Framework project development, and corporate sustainability reporting.
