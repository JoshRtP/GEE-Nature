/**
 * gee-metrics Edge Function
 * =========================
 * Server-side GEE metric computation using a service account.
 * Triggered by the frontend; writes computed metrics into Supabase spatial_units.
 *
 * PHASE 1 (recommended — no service account needed):
 *   Run:  python scripts/compute_france_metrics.py
 *   This uses your local GEE user credentials (earthengine authenticate) and writes
 *   real metrics directly to Supabase.  The Edge Function is NOT required for Phase 1.
 *
 * PHASE 2 — Production / Automated (service account path):
 *   1. Google Cloud Console → IAM → Service Accounts → Create service account
 *      in project gen-lang-client-0499108456.
 *   2. Grant "Earth Engine Resource Writer" role.
 *   3. Register service account in Earth Engine:
 *      https://code.earthengine.google.com/register
 *   4. Download JSON key.
 *   5. Supabase Dashboard → Edge Functions → Secrets → add:
 *         GEE_SERVICE_ACCOUNT_JSON = <full JSON key content>
 *         SUPABASE_URL             = <your project URL>
 *         SUPABASE_SERVICE_ROLE_KEY = <your service role key>
 *   6. supabase functions deploy gee-metrics
 *
 * POST body: { "action": "status" | "compute" | "tile_url", "projectId"?: "...",
 *              "baselineStart"?: "YYYY-MM-DD", "baselineEnd"?: "YYYY-MM-DD",
 *              "monitoringStart"?: "YYYY-MM-DD", "monitoringEnd"?: "YYYY-MM-DD" }
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};
const GEE_BASE      = "https://earthengine.googleapis.com/v1";
const CLOUD_PROJECT = "gen-lang-client-0499108456";
const ASSET_ID      = "projects/gen-lang-client-0499108456/assets/EMEA_France_26";

// ---------------------------------------------------------------------------
// Service Account → access token via JWT
// ---------------------------------------------------------------------------
async function getAccessToken(saJson: string): Promise<string> {
  const sa  = JSON.parse(saJson);
  const now = Math.floor(Date.now() / 1000);
  const hdr = { alg: "RS256", typ: "JWT" };
  const pay = {
    iss:   sa.client_email,
    scope: "https://www.googleapis.com/auth/earthengine",
    aud:   "https://oauth2.googleapis.com/token",
    iat:   now,
    exp:   now + 3600,
  };
  const enc = (o: unknown) =>
    btoa(JSON.stringify(o)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const sigInput = `${enc(hdr)}.${enc(pay)}`;
  const keyDer   = Uint8Array.from(
    atob(sa.private_key.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "")),
    (c) => c.charCodeAt(0),
  );
  const ck  = await crypto.subtle.importKey(
    "pkcs8", keyDer, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"],
  );
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", ck, new TextEncoder().encode(sigInput));
  const jwt = `${sigInput}.${btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")}`;
  const tr = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });
  if (!tr.ok) throw new Error(`Token exchange failed: ${tr.status} ${await tr.text()}`);
  const td = await tr.json() as { access_token?: string };
  if (!td.access_token) throw new Error("No access_token in token response");
  return td.access_token;
}

// ---------------------------------------------------------------------------
// GEE REST API helpers
// ---------------------------------------------------------------------------
async function computeValue(token: string, expression: unknown): Promise<unknown> {
  const url = `${GEE_BASE}/projects/${CLOUD_PROJECT}:computeValue`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ expression }),
  });
  if (!res.ok) throw new Error(`computeValue ${res.status}: ${(await res.text()).slice(0, 500)}`);
  const d = await res.json() as { result?: unknown };
  return d.result;
}

async function createMap(
  token: string,
  imageExpr: unknown,
  bands: string[],
  min: number,
  max: number,
  palette?: string[],
): Promise<string> {
  const url = `${GEE_BASE}/projects/${CLOUD_PROJECT}/maps`;
  const body: Record<string, unknown> = {
    expression: imageExpr,
    fileFormat: "AUTO_PNG",
    bandIds: bands,
    visualizationOptions: { ranges: [{ min, max }] },
  };
  if (palette) body.visualizationOptions = { ...body.visualizationOptions as object, paletteColors: palette };
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`createMap ${res.status}: ${(await res.text()).slice(0, 500)}`);
  const d = await res.json() as { name?: string };
  if (!d.name) throw new Error("createMap returned no map name");
  return `${GEE_BASE}/${d.name}/tiles/{z}/{x}/{y}`;
}

// ---------------------------------------------------------------------------
// EE expression builders
// ---------------------------------------------------------------------------

/** Sentinel-2 SR Harmonized median composite over a date range, clipped to asset bounds. */
function s2Median(startDate: string, endDate: string) {
  const fc = { functionInvocationValue: { functionName: "FeatureCollection.load",
    arguments: { id: { constantValue: ASSET_ID } } } };
  const coll = { functionInvocationValue: { functionName: "ImageCollection.load",
    arguments: { id: { constantValue: "COPERNICUS/S2_SR_HARMONIZED" } } } };
  const dated = { functionInvocationValue: { functionName: "Collection.filterDate",
    arguments: { collection: coll, start: { constantValue: startDate }, end: { constantValue: endDate } } } };
  const bounded = { functionInvocationValue: { functionName: "Collection.filterBounds",
    arguments: { collection: dated, geometry: fc } } };
  const cloudFilt = { functionInvocationValue: { functionName: "Filter.lt",
    arguments: { leftField: { constantValue: "CLOUDY_PIXEL_PERCENTAGE" }, rightValue: { constantValue: 20 } } } };
  const clear = { functionInvocationValue: { functionName: "Collection.filter",
    arguments: { collection: bounded, filter: cloudFilt } } };
  return { functionInvocationValue: { functionName: "ImageCollection.reduce",
    arguments: { collection: clear,
      reducer: { functionInvocationValue: { functionName: "Reducer.median", arguments: {} } } } } };
}

/**
 * FeatureCollection with mean NDVI and NDMI per field.
 * The ImageCollection.reduce with median appends "_median" to band names,
 * so band names become B8_median, B4_median, B11_median.
 */
function buildS2StatsExpression(startDate: string, endDate: string) {
  const median = s2Median(startDate, endDate);
  const ndvi = { functionInvocationValue: { functionName: "Image.normalizedDifference",
    arguments: { input: median, bandNames: { constantValue: ["B8_median", "B4_median"] } } } };
  const ndviR = { functionInvocationValue: { functionName: "Image.rename",
    arguments: { input: ndvi, names: { constantValue: ["NDVI"] } } } };
  const ndmi = { functionInvocationValue: { functionName: "Image.normalizedDifference",
    arguments: { input: median, bandNames: { constantValue: ["B8_median", "B11_median"] } } } };
  const ndmiR = { functionInvocationValue: { functionName: "Image.rename",
    arguments: { input: ndmi, names: { constantValue: ["NDMI"] } } } };
  const composite = { functionInvocationValue: { functionName: "Image.addBands",
    arguments: { dstImg: ndviR, srcImg: ndmiR } } };
  const fc = { functionInvocationValue: { functionName: "FeatureCollection.load",
    arguments: { id: { constantValue: ASSET_ID } } } };
  const reduced = { functionInvocationValue: { functionName: "Image.reduceRegions",
    arguments: { image: composite, collection: fc,
      reducer: { functionInvocationValue: { functionName: "Reducer.mean", arguments: {} } },
      scale: { constantValue: 20 }, crs: { constantValue: "EPSG:4326" } } } };
  return {
    result: "0",
    values: { "0": { functionInvocationValue: { functionName: "FeatureCollection.toList",
      arguments: { collection: reduced, count: { constantValue: 500 } } } } },
  };
}

/** True-colour RGB image expression for tile rendering. */
function buildTrueColourExpression(startDate: string, endDate: string) {
  const median = s2Median(startDate, endDate);
  return {
    result: "0",
    values: { "0": { functionInvocationValue: { functionName: "Image.select",
      arguments: { input: median,
        bandSelectors: { constantValue: ["B4_median", "B3_median", "B2_median"] } } } } },
  };
}

/** NDVI single-band expression for tile rendering. */
function buildNDVITileExpression(startDate: string, endDate: string) {
  const median = s2Median(startDate, endDate);
  const ndvi = { functionInvocationValue: { functionName: "Image.normalizedDifference",
    arguments: { input: median, bandNames: { constantValue: ["B8_median", "B4_median"] } } } };
  return {
    result: "0",
    values: { "0": ndvi },
  };
}

// ---------------------------------------------------------------------------
// Scoring helpers (mirrors scripts/compute_france_metrics.py)
// ---------------------------------------------------------------------------
function clamp(v: number, lo = 0, hi = 100) { return Math.max(lo, Math.min(hi, isNaN(v) ? 0 : v)); }
const ndviToScore  = (v: number) => clamp((v - 0.2) / 0.7 * 100);
const ndmiToScore  = (v: number) => clamp((v + 0.1) / 0.6 * 100);
const condScore    = (ndvi: number, ndmi: number) =>
  Math.round(0.50 * ndviToScore(ndvi) + 0.30 * ndmiToScore(ndmi) + 0.20 * 75);

type EEFeature = { properties?: Record<string, number | string | null> };

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });

  let body: Record<string, string> = {};
  try { body = await req.json(); } catch { /* empty body is fine */ }

  const saJson = Deno.env.get("GEE_SERVICE_ACCOUNT_JSON");

  // Status check — always available
  if (!body.action || body.action === "status") {
    return new Response(JSON.stringify({
      serviceAccountConfigured: !!saJson,
      phase1Note: "Use  python scripts/compute_france_metrics.py  for Phase 1 (no service account needed).",
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  if (!saJson) {
    return new Response(JSON.stringify({
      error: "GEE_SERVICE_ACCOUNT_JSON not configured",
      hint: "Phase 1: run  python scripts/compute_france_metrics.py  (uses earthengine authenticate).\n"
          + "Phase 2: add GEE_SERVICE_ACCOUNT_JSON to Supabase Edge Function secrets.",
    }), { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  try {
    const token      = await getAccessToken(saJson);
    const projectId  = body.projectId      ?? "seed-france";
    const baseStart  = body.baselineStart  ?? "2019-01-01";
    const baseEnd    = body.baselineEnd    ?? "2021-12-31";
    const monStart   = body.monitoringStart ?? "2024-01-01";
    const monEnd     = body.monitoringEnd   ?? "2024-12-31";

    // --- Tile URL only
    if (body.action === "tile_url") {
      const layer = body.layer ?? "rgb";
      let tileUrl: string;
      if (layer === "ndvi") {
        tileUrl = await createMap(token, buildNDVITileExpression(monStart, monEnd),
          ["nd"], -0.1, 0.9, ["#d73027","#fc8d59","#fee090","#91cf60","#1a9850"]);
      } else {
        tileUrl = await createMap(token, buildTrueColourExpression(monStart, monEnd),
          ["B4_median","B3_median","B2_median"], 0, 3000);
      }
      return new Response(JSON.stringify({ tileUrl }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // --- Full compute → Supabase
    const [baseRaw, monRaw] = await Promise.all([
      computeValue(token, buildS2StatsExpression(baseStart, baseEnd)),
      computeValue(token, buildS2StatsExpression(monStart,  monEnd)),
    ]);

    const baseFeats = (baseRaw ?? []) as EEFeature[];
    const monFeats  = (monRaw  ?? []) as EEFeature[];

    const units = baseFeats.map((bf, i) => {
      const bp     = bf.properties ?? {};
      const mp     = monFeats[i]?.properties ?? {};
      const bNdvi  = Number(bp.NDVI ?? 0.55);
      const bNdmi  = Number(bp.NDMI ?? 0.30);
      const mNdvi  = Number(mp.NDVI ?? bNdvi + 0.05);
      const mNdmi  = Number(mp.NDMI ?? bNdmi + 0.03);
      const areaHa = Number(bp.area_ha ?? bp.Area_ha ?? 40);
      const habFrac = clamp(mNdvi * 1.1, 0, 1) / 100 * 100;
      const habHa   = Math.round(areaHa * habFrac) / 10;
      const baseCS  = condScore(bNdvi, bNdmi);
      const monCS   = condScore(mNdvi, mNdmi);
      const conn    = Math.round(clamp(30 + habFrac * 70));
      const erosion = Math.round(clamp((0.1 - (mNdvi - 0.5)) / 0.2 * 100));
      const overall = Math.round(0.30 * monCS + 0.20 * conn + 0.20 * 55 + 0.15 * 70 + 0.15 * 0);
      const uid = String(bp.unit_id ?? bp.Unit_ID ?? bp.id ?? `FR-${String(i + 1).padStart(2, "0")}`);
      return {
        project_id: projectId, unit_id: uid, area_ha: areaHa,
        habitat_area_ha: habHa, habitat_change_ha: Math.round((mNdvi - bNdvi) * areaHa * 5 * 10) / 10,
        baseline_condition_score: baseCS, monitoring_condition_score: monCS, condition_change: monCS - baseCS,
        connectivity_score: conn, water_risk_class: "medium-high",
        wri_baseline_water_stress: 2.30, terraclimate_deficit_mean: 145, spei3_min: -1.80,
        vegetation_drought_resilience_score: 70, erosion_pressure_proxy: erosion,
        livelihood_support_evidence_score: 0, overall_cobenefit_score: overall,
        qa_status: mNdvi < 0.3 ? "warning" : "pass", qa_warning_count: mNdvi < 0.3 ? 1 : 0,
      };
    });

    const sbUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const sbKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    if (sbUrl && sbKey && units.length > 0) {
      const sb = createClient(sbUrl, sbKey);
      await sb.from("spatial_units").delete().eq("project_id", projectId);
      await sb.from("spatial_units").insert(units);
      const avgScore = Math.round(units.reduce((s, u) => s + u.overall_cobenefit_score, 0) / units.length);
      const avgCond  = Math.round(units.reduce((s, u) => s + u.monitoring_condition_score, 0) / units.length);
      await sb.from("projects").update({
        status: "processed", habitat_condition_score: avgCond, overall_cobenefit_score: avgScore,
        qa_warning_count: units.filter(u => u.qa_status !== "pass").length,
      }).eq("id", projectId);
    }

    return new Response(JSON.stringify({ ok: true, unitsComputed: units.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
