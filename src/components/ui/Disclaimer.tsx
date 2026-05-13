import { Info } from 'lucide-react';

export function Disclaimer({ text }: { text?: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-tn-border bg-tn-surface px-3 py-2 text-xs text-tn-text-muted">
      <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-tn-text-subtle" />
      <span>
        {text ||
          'This platform generates co-benefit evidence and does not issue credits or certify outcomes.'}
      </span>
    </div>
  );
}
