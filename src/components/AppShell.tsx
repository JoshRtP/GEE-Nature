import type { ReactNode } from 'react';
import { Satellite, LogIn, Loader2 } from 'lucide-react';
import { Disclaimer } from './ui/Disclaimer';
import { useEarthEngine } from '../lib/useEarthEngine';

interface Props {
  children: ReactNode;
  onHome: () => void;
  breadcrumb?: { label: string; onClick?: () => void }[];
}

export function AppShell({ children, onHome, breadcrumb = [] }: Props) {
  const { state: eeState, login, logout } = useEarthEngine();

  return (
    <div className="min-h-screen bg-tn-bg">
      <header className="sticky top-0 z-20 border-b border-tn-header-border bg-tn-header/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={onHome}
            className="flex items-center gap-3 text-left"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-tn-accent/20 ring-1 ring-tn-accent/40">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L3 7L12 12L21 7L12 2Z" fill="#238636" stroke="#238636" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M3 12L12 17L21 12" stroke="#238636" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 17L12 22L21 17" stroke="#2ea043" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
              </svg>
            </div>
            <span className="leading-tight">
              <span className="block text-sm font-bold tracking-wide text-tn-text">TerraNexus</span>
              <span className="block text-[11px] text-tn-text-muted">Co-benefit &amp; resilience monitoring</span>
            </span>
          </button>
          <nav className="hidden gap-6 text-sm md:flex">
            <span className="font-medium text-tn-text">Projects</span>
            <span className="text-tn-text-subtle cursor-default">Datasets</span>
            <span className="text-tn-text-subtle cursor-default">Methods</span>
            <span className="text-tn-text-subtle cursor-default">Reports</span>
          </nav>
          <div className="hidden items-center gap-2 sm:flex">
            {eeState === 'ready' ? (
              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-1.5 rounded-full border border-tn-accent/40 bg-tn-accent/15 px-2.5 py-1 text-xs font-medium text-tn-accent hover:bg-tn-accent/25 transition-colors"
              >
                <Satellite className="h-3 w-3" /> GEE connected
              </button>
            ) : eeState === 'authenticating' ? (
              <span className="flex items-center gap-1.5 rounded-full border border-tn-border bg-tn-surface px-2.5 py-1 text-xs text-tn-text-muted">
                <Loader2 className="h-3 w-3 animate-spin" /> Connecting…
              </span>
            ) : (
              <button
                type="button"
                onClick={login}
                className="flex items-center gap-1.5 rounded-full border border-tn-border bg-tn-surface px-2.5 py-1 text-xs text-tn-text-muted hover:border-tn-accent/40 hover:text-tn-accent transition-colors"
              >
                <LogIn className="h-3 w-3" /> Sign in to GEE
              </button>
            )}
            <span className="rounded-full border border-tn-border bg-tn-hover px-2.5 py-1 text-xs font-medium text-tn-text-subtle">
              MVP
            </span>
          </div>
        </div>
        {breadcrumb.length ? (
          <div className="border-t border-tn-border/50 bg-tn-surface/60">
            <div className="mx-auto flex max-w-7xl items-center gap-1.5 px-4 py-2 text-xs text-tn-text-subtle sm:px-6">
              <button onClick={onHome} className="hover:text-tn-accent transition-colors">Projects</button>
              {breadcrumb.map((b, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <span className="text-tn-border">/</span>
                  {b.onClick ? (
                    <button onClick={b.onClick} className="hover:text-tn-accent transition-colors">{b.label}</button>
                  ) : (
                    <span className="text-tn-text-muted">{b.label}</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</main>
      <footer className="mx-auto max-w-7xl px-4 pb-10 sm:px-6">
        <Disclaimer />
        <p className="mt-3 text-center text-[11px] text-tn-text-subtle">
          TerraNexus · Aligned with CCB, SD VISta, Verra Nature Framework support, and corporate sustainability reporting.
        </p>
      </footer>
    </div>
  );
}
