interface NumFieldProps {
  label: string;
  v: number;
  on: (n: number) => void;
}

export function NumField({ label, v, on }: NumFieldProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-tn-text-muted">
        {label}
      </span>
      <input
        type="number"
        min={0}
        value={v}
        onChange={e => on(Number(e.target.value || 0))}
        className="w-full rounded-md border border-tn-border bg-tn-surface2 px-3 py-2 text-sm text-tn-text focus:border-tn-accent focus:outline-none focus:ring-2 focus:ring-tn-accent/20"
      />
    </label>
  );
}

interface TextFieldProps {
  label: string;
  v: string;
  on: (s: string) => void;
  className?: string;
}

export function TextField({ label, v, on, className = '' }: TextFieldProps) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-tn-text-muted">
        {label}
      </span>
      <textarea
        value={v}
        onChange={e => on(e.target.value)}
        rows={3}
        className="w-full rounded-md border border-tn-border bg-tn-surface2 px-3 py-2 text-sm text-tn-text focus:border-tn-accent focus:outline-none focus:ring-2 focus:ring-tn-accent/20"
      />
    </label>
  );
}
