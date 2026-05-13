import { Satellite, CheckCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { useGEEStatus } from '../lib/useEarthEngine';

interface Props {
  projectId: string;
  children: React.ReactNode;
  /** If true, always renders children even when data isn't live yet */
  optional?: boolean;
}

/**
 * GEEDataStatus
 * -------------
 * Shows a status banner for GEE data sourcing.
 *   - "live"      → green banner (data computed from real GEE)
 *   - "no_data"   → amber banner with instructions to run compute script
 *   - "computing" → spinner
 *   - "error"     → red banner with error detail
 *
 * No OAuth / no browser GEE SDK — all computation is server-side.
 */
export function GEELoginGate({ projectId, children, optional = false }: Props) {
  const { state, lastComputedAt, error, triggerCompute } = useGEEStatus();

  const banner = (() => {
    switch (state) {
      case 'live':
        return (
          <div className="mb-4 flex items-center justify-between rounded-lg border border-tn-accent/30 bg-tn-accent/10 px-3 py-2 text-xs text-tn-accent">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3.5 w-3.5" />
              <span className="font-medium">Live GEE data</span>
              {lastComputedAt && (
                <span className="text-tn-text-muted">
                  · computed {new Date(lastComputedAt).toLocaleDateString()}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => triggerCompute(projectId)}
              className="flex items-center gap-1 text-tn-text-subtle hover:text-tn-text transition-colors"
              title="Re-run GEE computation (requires service account)"
            >
              <RefreshCw className="h-3 w-3" /> Refresh
            </button>
          </div>
        );

      case 'computing':
        return (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-tn-border bg-tn-surface px-3 py-2 text-xs text-tn-text-muted">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-tn-accent" />
            <span>Computing GEE metrics…</span>
          </div>
        );

      case 'error':
        return (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
            <div>
              <span className="font-medium">GEE computation error — </span>
              <span>{error}</span>
            </div>
          </div>
        );

      case 'no_data':
      default:
        return (
          <div className="mb-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-xs text-yellow-300">
            <div className="flex items-start gap-2">
              <Satellite className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-yellow-400" />
              <div className="space-y-1">
                <p className="font-medium">Showing pre-loaded data · not yet connected to live GEE</p>
                <p className="text-yellow-400/80">
                  To load real satellite metrics, run:{' '}
                  <code className="rounded bg-yellow-500/20 px-1 font-mono text-yellow-200">
                    python scripts/compute_france_metrics.py
                  </code>
                </p>
              </div>
            </div>
          </div>
        );
    }
  })();

  if (!optional && state === 'no_data') {
    return (
      <div className="space-y-4">
        {banner}
        {children}
      </div>
    );
  }

  return (
    <>
      {banner}
      {children}
    </>
  );
}
