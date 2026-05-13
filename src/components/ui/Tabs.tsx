interface Tab {
  id: string;
  label: string;
}

interface Props {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
}

export function Tabs({ tabs, active, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-1 border-b border-tn-border">
      {tabs.map(t => {
        const on = t.id === active;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={`relative -mb-px px-4 py-2.5 text-sm font-medium transition ${
              on
                ? 'border-b-2 border-tn-accent text-tn-accent'
                : 'border-b-2 border-transparent text-tn-text-muted hover:text-tn-text'
            }`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
