/**
 * geeService.ts — GEE integration service (server-side only)
 *
 * ALL GEE computation happens server-side, never in the browser.
 *
 * Phase 1 (current):
 *   Run  python scripts/compute_france_metrics.py  to compute metrics and
 *   write them to Supabase.  The frontend reads results from Supabase.
 *
 * Phase 2 (production, requires service account in Supabase secrets):
 *   triggerCompute() calls the gee-metrics Edge Function which runs GEE
 *   server-side and writes to Supabase automatically.
 *
 * Phase 3 (map tiles):
 *   fetchTileUrl() calls the Edge Function for a real Sentinel-2 tile URL
 *   to render in the MapPanel.
 */

import { supabase } from '../lib/supabase';

export interface TriggerComputeResult {
  ok: boolean;
  unitsComputed?: number;
  error?: string;
}

/**
 * Trigger a full GEE metric computation via the Supabase Edge Function.
 * Requires GEE_SERVICE_ACCOUNT_JSON configured in Supabase secrets.
 * Phase 1: Use scripts/compute_france_metrics.py instead.
 */
export async function triggerGEECompute(
  projectId: string,
  options?: {
    baselineStart?: string;
    baselineEnd?: string;
    monitoringStart?: string;
    monitoringEnd?: string;
  },
): Promise<TriggerComputeResult> {
  const { data, error } = await supabase.functions.invoke('gee-metrics', {
    body: {
      action: 'compute',
      projectId,
      baselineStart:   options?.baselineStart   ?? '2019-01-01',
      baselineEnd:     options?.baselineEnd      ?? '2021-12-31',
      monitoringStart: options?.monitoringStart  ?? '2024-01-01',
      monitoringEnd:   options?.monitoringEnd    ?? '2024-12-31',
    },
  });
  if (error) return { ok: false, error: error.message ?? String(error) };
  if (data?.error) return { ok: false, error: data.error };
  return { ok: true, unitsComputed: data?.unitsComputed };
}

/**
 * Fetch a Sentinel-2 tile URL from the Edge Function.
 * Returns null if the service account is not configured (Phase 1).
 * layer: 'rgb' (true colour) | 'ndvi' (NDVI false colour)
 */
export async function fetchGEETileUrl(
  projectId: string,
  layer: 'rgb' | 'ndvi' = 'rgb',
  monitoringStart = '2024-01-01',
  monitoringEnd   = '2024-12-31',
): Promise<string | null> {
  try {
    const { data, error } = await supabase.functions.invoke('gee-metrics', {
      body: {
        action: 'tile_url',
        projectId,
        layer,
        monitoringStart,
        monitoringEnd,
      },
    });
    if (error || data?.error || !data?.tileUrl) return null;
    return data.tileUrl as string;
  } catch {
    return null;
  }
}

/**
 * Check whether the Edge Function has a service account configured.
 */
export async function getGEEStatus(): Promise<{
  serviceAccountConfigured: boolean;
  phase1Note: string;
}> {
  try {
    const { data } = await supabase.functions.invoke('gee-metrics', {
      body: { action: 'status' },
    });
    return data ?? { serviceAccountConfigured: false, phase1Note: '' };
  } catch {
    return { serviceAccountConfigured: false, phase1Note: 'Edge Function not deployed.' };
  }
}
