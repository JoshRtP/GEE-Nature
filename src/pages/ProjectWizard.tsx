import { useState } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight, FileUp, MapPinned, Sliders, Sprout, ClipboardCheck } from 'lucide-react';
import { createProject } from '../services/projectService';
import type { Alignment, EcosystemType, Project } from '../types';
import { Disclaimer } from '../components/ui/Disclaimer';

interface Props {
  onCancel: () => void;
  onCreated: (project: Project) => void;
}

const STEPS = [
  { id: 1, label: 'Project details', icon: Sprout },
  { id: 2, label: 'Periods', icon: Sliders },
  { id: 3, label: 'Boundary', icon: MapPinned },
  { id: 4, label: 'Habitat mapping', icon: FileUp },
  { id: 5, label: 'Review', icon: ClipboardCheck },
];

const ECOSYSTEMS: EcosystemType[] = ['cropland', 'grassland', 'forest', 'agroforestry', 'wetland', 'mixed'];
const ALIGNMENTS: { id: Alignment; label: string; desc: string }[] = [
  { id: 'CCB', label: 'CCB Standards', desc: 'Climate, Community & Biodiversity co-benefits.' },
  { id: 'SD_VISta', label: 'SD VISta', desc: 'Sustainable Development Verified Impact Standard.' },
  { id: 'Nature_Framework', label: 'Nature Framework', desc: 'Verra Nature Framework project development support.' },
  { id: 'Corporate', label: 'Corporate reporting', desc: 'Corporate sustainability and nature programs.' },
];

const SOURCE_CLASSES = ['Tree cover', 'Grassland', 'Shrubland', 'Cropland', 'Built-up', 'Permanent water', 'Herbaceous wetland'];
const PLATFORM_CLASSES = ['Forest habitat', 'Grassland habitat', 'Shrubland habitat', 'Managed agricultural land', 'Non-habitat', 'Aquatic habitat', 'Wetland habitat'];

export function ProjectWizard({ onCancel, onCreated }: Props) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [ecosystem, setEcosystem] = useState<EcosystemType>('mixed');
  const [alignment, setAlignment] = useState<Alignment[]>(['CCB']);
  const [baselineStart, setBaselineStart] = useState('2019-01-01');
  const [baselineEnd, setBaselineEnd] = useState('2021-12-31');
  const [monitoringStart, setMonitoringStart] = useState('2024-01-01');
  const [monitoringEnd, setMonitoringEnd] = useState('2025-06-30');
  const [boundaryFile, setBoundaryFile] = useState<File | null>(null);
  const [habitatMap, setHabitatMap] = useState<Record<string, string>>(() =>
    Object.fromEntries(SOURCE_CLASSES.map((s, i) => [s, PLATFORM_CLASSES[i] || 'Non-habitat']))
  );

  const toggleAlignment = (a: Alignment) =>
    setAlignment(arr => (arr.includes(a) ? arr.filter(x => x !== a) : [...arr, a]));

  const canNext =
    (step === 1 && name.trim() && country.trim()) ||
    (step === 2 && baselineStart && baselineEnd && monitoringStart && monitoringEnd) ||
    step === 3 ||
    step === 4 ||
    step === 5;

  const submit = async () => {
    setSubmitting(true);
    try {
      const project = await createProject({
        name,
        country,
        ecosystem_type: ecosystem,
        alignment,
        baseline_start: baselineStart,
        baseline_end: baselineEnd,
        monitoring_start: monitoringStart,
        monitoring_end: monitoringEnd,
      });
      onCreated(project);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-tn-text">Create a new project</h1>
        <p className="mt-1 text-sm text-tn-text-muted">Configure project details, monitoring periods, and boundary inputs.</p>
      </div>

      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {STEPS.map(s => {
          const done = step > s.id;
          const active = step === s.id;
          const Icon = s.icon;
          return (
            <li
              key={s.id}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${
                active ? 'border-tn-accent/50 bg-tn-accent/10 text-tn-accent' : done ? 'border-tn-accent/30 bg-tn-surface text-tn-accent' : 'border-tn-border bg-tn-surface text-tn-text-subtle'
              }`}
            >
              <span className={`flex h-6 w-6 items-center justify-center rounded-full ${active ? 'bg-tn-accent text-white' : done ? 'bg-tn-accent/20 text-tn-accent' : 'bg-tn-hover text-tn-text-subtle'}`}>
                {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
              </span>
              <span className="font-medium">{s.label}</span>
            </li>
          );
        })}
      </ol>

      <div className="rounded-xl border border-tn-border bg-tn-surface p-6">
        {step === 1 ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Project name">
              <input value={name} onChange={e => setName(e.target.value)} className={inputCls} placeholder="e.g. Andalusia Dryland Regenerative Agriculture" />
            </Field>
            <Field label="Country">
              <input value={country} onChange={e => setCountry(e.target.value)} className={inputCls} placeholder="Spain" />
            </Field>
            <Field label="Ecosystem type">
              <select value={ecosystem} onChange={e => setEcosystem(e.target.value as EcosystemType)} className={inputCls}>
                {ECOSYSTEMS.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </Field>
            <Field label="Intended alignment" className="md:col-span-2">
              <div className="grid gap-2 sm:grid-cols-2">
                {ALIGNMENTS.map(a => {
                  const on = alignment.includes(a.id);
                  return (
                    <label key={a.id} className={`cursor-pointer rounded-lg border p-3 text-sm transition ${on ? 'border-tn-accent/50 bg-tn-accent/10' : 'border-tn-border bg-tn-surface2 hover:border-tn-accent/30'}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-tn-text">{a.label}</span>
                        <input type="checkbox" checked={on} onChange={() => toggleAlignment(a.id)} className="h-3.5 w-3.5 rounded border-tn-border accent-tn-accent" />
                      </div>
                      <p className="mt-1 text-xs text-tn-text-muted">{a.desc}</p>
                    </label>
                  );
                })}
              </div>
            </Field>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Baseline start"><input type="date" value={baselineStart} onChange={e => setBaselineStart(e.target.value)} className={inputCls} /></Field>
            <Field label="Baseline end"><input type="date" value={baselineEnd} onChange={e => setBaselineEnd(e.target.value)} className={inputCls} /></Field>
            <Field label="Monitoring start"><input type="date" value={monitoringStart} onChange={e => setMonitoringStart(e.target.value)} className={inputCls} /></Field>
            <Field label="Monitoring end"><input type="date" value={monitoringEnd} onChange={e => setMonitoringEnd(e.target.value)} className={inputCls} /></Field>
            <div className="md:col-span-2"><Disclaimer text="Periods should be seasonally comparable. Drought-resilience metrics require drought observations during the monitoring period." /></div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-4">
            <Field label="Boundary file">
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-tn-border bg-tn-surface2 px-4 py-10 text-center text-sm text-tn-text-muted transition hover:border-tn-accent/50 hover:bg-tn-accent/5">
                <FileUp className="h-6 w-6 text-tn-text-subtle" />
                <span><span className="font-medium text-tn-text">Click to upload</span> or drop your file here</span>
                <span className="text-xs text-tn-text-subtle">GeoJSON · Zipped Shapefile · KML/KMZ · CSV with WKT</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={e => setBoundaryFile(e.target.files?.[0] || null)}
                  accept=".geojson,.json,.zip,.kml,.kmz,.csv"
                />
              </label>
            </Field>
            {boundaryFile ? <p className="text-xs text-tn-text-muted">Selected: <span className="font-medium text-tn-text">{boundaryFile.name}</span> ({(boundaryFile.size / 1024).toFixed(1)} KB)</p> : null}
            <Disclaimer text="Geometry validation, CRS reprojection to WGS84, and overlap checks run on the backend. TODO: integrate PostGIS validation." />
          </div>
        ) : null}

        {step === 4 ? (
          <div className="space-y-3">
            <p className="text-sm text-tn-text-muted">Map source land-cover classes to platform habitat categories. These mappings drive habitat extent and condition calculations.</p>
            <div className="overflow-hidden rounded-lg border border-tn-border">
              <table className="w-full text-sm">
                <thead className="bg-tn-surface2 text-tn-text-muted">
                  <tr><th className="px-3 py-2 text-left text-xs font-semibold uppercase">Source class</th><th className="px-3 py-2 text-left text-xs font-semibold uppercase">Platform habitat class</th></tr>
                </thead>
                <tbody className="divide-y divide-tn-border">
                  {SOURCE_CLASSES.map(src => (
                    <tr key={src} className="bg-tn-surface">
                      <td className="px-3 py-2 font-medium text-tn-text">{src}</td>
                      <td className="px-3 py-2">
                        <select value={habitatMap[src]} onChange={e => setHabitatMap(m => ({ ...m, [src]: e.target.value }))} className={inputCls + ' max-w-xs'}>
                          {PLATFORM_CLASSES.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {step === 5 ? (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-tn-text">Review and create</h3>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <Item k="Name" v={name || '—'} />
              <Item k="Country" v={country || '—'} />
              <Item k="Ecosystem" v={ecosystem} />
              <Item k="Alignment" v={alignment.join(', ') || '—'} />
              <Item k="Baseline" v={`${baselineStart} → ${baselineEnd}`} />
              <Item k="Monitoring" v={`${monitoringStart} → ${monitoringEnd}`} />
              <Item k="Boundary file" v={boundaryFile?.name || 'None uploaded'} />
              <Item k="Habitat classes mapped" v={`${Object.keys(habitatMap).length} mappings`} />
            </dl>
            <Disclaimer />
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-2">
        <button type="button" onClick={onCancel} className="text-sm text-tn-text-muted hover:text-tn-text transition-colors">Cancel</button>
        <div className="flex items-center gap-2">
          {step > 1 ? (
            <button type="button" onClick={() => setStep(s => s - 1)} className="inline-flex items-center gap-1.5 rounded-md border border-tn-border bg-tn-surface px-3 py-2 text-sm font-medium text-tn-text-muted hover:bg-tn-hover hover:text-tn-text transition-colors">
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
          ) : null}
          {step < 5 ? (
            <button
              type="button"
              disabled={!canNext}
              onClick={() => setStep(s => s + 1)}
              className="inline-flex items-center gap-1.5 rounded-md bg-tn-accent px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-tn-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="inline-flex items-center gap-1.5 rounded-md bg-tn-accent px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-tn-accent-hover disabled:opacity-60"
            >
              {submitting ? 'Creating…' : 'Create project'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const inputCls = 'w-full rounded-md border border-tn-border bg-tn-surface2 px-3 py-2 text-sm text-tn-text placeholder:text-tn-text-subtle focus:border-tn-accent focus:outline-none focus:ring-2 focus:ring-tn-accent/20';

function Field({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-tn-text-muted">{label}</span>
      {children}
    </label>
  );
}

function Item({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-md bg-tn-hover px-3 py-2">
      <dt className="text-[10px] font-semibold uppercase tracking-wide text-tn-text-subtle">{k}</dt>
      <dd className="mt-0.5 text-tn-text">{v}</dd>
    </div>
  );
}
