/**
 * useGEEStatus — replaces the old OAuth-based useEarthEngine hook.
 *
 * GEE computation is now entirely server-side:
 *   - Phase 1: Python script populates Supabase (run locally)
 *   - Phase 2: Supabase Edge Function (service account, automated)
 *
 * This hook:
 *   - Reports whether the current project has live GEE data in the DB
 *     (i.e. status === 'processed')
 *   - Provides a triggerCompute() function that calls the Edge Function
 *     to request a fresh computation (Phase 2 / production)
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { supabase } from './supabase';

export type GEEDataState =
  | 'unknown'      // not yet checked
  | 'no_data'      // project has draft/unprocessed status
  | 'live'         // project status = 'processed', data is real GEE output
  | 'computing'    // Edge Function compute in progress
  | 'error';

interface GEEStatusContext {
  state: GEEDataState;
  lastComputedAt: string | null;
  error: string | null;
  /** Triggers the Edge Function to recompute metrics (requires service account configured). */
  triggerCompute: (projectId: string) => Promise<void>;
}

const Context = createContext<GEEStatusContext>({
  state: 'unknown',
  lastComputedAt: null,
  error: null,
  triggerCompute: async () => {},
});

export function GEEStatusProvider({ children, projectId }: { children: ReactNode; projectId?: string }) {
  const [state, setState] = useState<GEEDataState>('unknown');
  const [lastComputedAt, setLastComputedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;
    supabase
      .from('projects')
      .select('status, updated_at')
      .eq('id', projectId)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        if (!data) { setState('no_data'); return; }
        if (data.status === 'processed') {
          setState('live');
          setLastComputedAt(data.updated_at ?? null);
        } else {
          setState('no_data');
        }
      });
    return () => { cancelled = true; };
  }, [projectId]);

  const triggerCompute = useCallback(async (pid: string) => {
    setState('computing');
    setError(null);
    try {
      const { data, error: fnErr } = await supabase.functions.invoke('gee-metrics', {
        body: { action: 'compute', projectId: pid },
      });
      if (fnErr) throw fnErr;
      if (data?.error) throw new Error(data.error);
      setState('live');
      setLastComputedAt(new Date().toISOString());
    } catch (err) {
      setState('error');
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  return (
    <Context.Provider value={{ state, lastComputedAt, error, triggerCompute }}>
      {children}
    </Context.Provider>
  );
}

export function useGEEStatus() {
  return useContext(Context);
}

// ---------------------------------------------------------------------------
// Back-compat shim — components that previously called useEarthEngine()
// can import this alias while we migrate them one by one.
// ---------------------------------------------------------------------------
/** @deprecated Use useGEEStatus() */
export function useEarthEngine() {
  const { state, error, triggerCompute } = useGEEStatus();
  return {
    state: state === 'live' ? 'ready' : state === 'computing' ? 'authenticating' : 'idle',
    error,
    userEmail: null as string | null,
    login: () => {},
    logout: () => {},
    triggerCompute,
  };
}

/** @deprecated — wraps children without OAuth. Use GEEStatusProvider instead. */
export function EarthEngineProvider({ children }: { children: ReactNode }) {
  return <GEEStatusProvider>{children}</GEEStatusProvider>;
}
