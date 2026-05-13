import { LogIn, Satellite, AlertCircle, Loader2, LogOut } from 'lucide-react';
import { useEarthEngine } from '../lib/useEarthEngine';

interface Props {
  children: React.ReactNode;
  /** If true, renders children but shows a status bar at the top */
  optional?: boolean;
}

export function GEELoginGate({ children, optional = false }: Props) {
  const { state, error, userEmail, login, logout } = useEarthEngine();

  if (state === 'ready') {
    return (
      <>
        <div className="mb-4 flex items-center justify-between rounded-lg border border-tn-accent/30 bg-tn-accent/10 px-3 py-2 text-xs text-tn-accent">
          <div className="flex items-center gap-2">
            <Satellite className="h-3.5 w-3.5" />
            <span className="font-medium">Google Earth Engine connected</span>
            {userEmail ? <span className="text-tn-text-muted">· {userEmail}</span> : null}
          </div>
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1 text-tn-text-subtle hover:text-tn-text transition-colors"
          >
            <LogOut className="h-3 w-3" /> Disconnect
          </button>
        </div>
        {children}
      </>
    );
  }

  if (optional) {
    return (
      <>
        <div className="mb-4 flex items-center justify-between rounded-lg border border-tn-border bg-tn-surface px-3 py-2 text-xs text-tn-text-muted">
          <div className="flex items-center gap-2">
            <Satellite className="h-3.5 w-3.5 text-tn-text-subtle" />
            <span>Connect Google Earth Engine for live satellite data</span>
          </div>
          <button
            type="button"
            onClick={login}
            disabled={state === 'authenticating'}
            className="flex items-center gap-1.5 rounded-md bg-tn-accent px-2.5 py-1 text-xs font-medium text-white hover:bg-tn-accent-hover disabled:opacity-50 transition-colors"
          >
            {state === 'authenticating' ? (
              <><Loader2 className="h-3 w-3 animate-spin" /> Connecting…</>
            ) : (
              <><LogIn className="h-3 w-3" /> Sign in with Google</>
            )}
          </button>
        </div>
        {children}
      </>
    );
  }

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-tn-border bg-tn-surface p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-tn-accent/15 ring-1 ring-tn-accent/30">
        <Satellite className="h-7 w-7 text-tn-accent" />
      </div>

      <h2 className="mt-5 text-lg font-semibold text-tn-text">
        Connect Google Earth Engine
      </h2>
      <p className="mt-2 max-w-sm text-sm text-tn-text-muted">
        Sign in with your Google account to load live satellite data from GEE asset{' '}
        <code className="rounded bg-tn-hover px-1 py-0.5 text-xs text-tn-text">EMEA_France_26</code>.
      </p>

      {error ? (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-left text-xs text-red-400">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      <button
        type="button"
        onClick={login}
        disabled={state === 'authenticating'}
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-tn-accent px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-tn-accent-hover disabled:opacity-60"
      >
        {state === 'authenticating' ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Connecting…</>
        ) : (
          <>
            <GoogleIcon />
            Sign in with Google
          </>
        )}
      </button>

      <p className="mt-4 max-w-xs text-xs text-tn-text-subtle">
        Your Google account must have access to the GCP project{' '}
        <span className="font-mono">api-project-48442550024</span> and the Earth Engine API.
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}
