import type { ReactNode } from 'react';

interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  align?: 'left' | 'right' | 'center';
  className?: string;
}

interface Props<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (r: T) => string;
  empty?: string;
}

export function MetricTable<T>({ columns, rows, rowKey, empty }: Props<T>) {
  if (!rows.length) {
    return <p className="rounded-md border border-dashed border-tn-border p-4 text-sm text-tn-text-muted">{empty || 'No rows.'}</p>;
  }
  return (
    <div className="overflow-x-auto rounded-lg border border-tn-border">
      <table className="w-full text-sm">
        <thead className="bg-tn-surface2 text-tn-text-muted">
          <tr>
            {columns.map(c => (
              <th
                key={c.key}
                className={`px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide ${
                  c.align === 'right' ? 'text-right' : c.align === 'center' ? 'text-center' : ''
                }`}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-tn-border">
          {rows.map(r => (
            <tr key={rowKey(r)} className="hover:bg-tn-hover transition-colors">
              {columns.map(c => (
                <td
                  key={c.key}
                  className={`px-3 py-2 text-tn-text ${c.align === 'right' ? 'text-right' : c.align === 'center' ? 'text-center' : ''} ${c.className || ''}`}
                >
                  {c.render(r)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
