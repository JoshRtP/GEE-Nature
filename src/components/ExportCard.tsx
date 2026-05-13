import type { LucideIcon } from 'lucide-react';
import { Download } from 'lucide-react';

interface Props {
  title: string;
  description: string;
  icon: LucideIcon;
  format: string;
  onExport?: () => void;
}

export function ExportCard({ title, description, icon: Icon, format, onExport }: Props) {
  return (
    <div className="flex flex-col rounded-xl border border-tn-border bg-tn-surface p-4 transition hover:border-tn-accent/40">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-tn-accent/15 text-tn-accent">
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold text-tn-text">{title}</h4>
          <p className="mt-0.5 text-xs text-tn-text-muted">{description}</p>
        </div>
        <span className="rounded bg-tn-hover px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-tn-text-subtle">
          {format}
        </span>
      </div>
      <button
        type="button"
        onClick={onExport}
        className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-md border border-tn-border bg-tn-surface2 px-3 py-1.5 text-sm font-medium text-tn-text-muted transition hover:border-tn-accent/40 hover:text-tn-accent"
      >
        <Download className="h-3.5 w-3.5" /> Export
      </button>
    </div>
  );
}
