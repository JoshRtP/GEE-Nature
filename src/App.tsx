import { useCallback, useState } from 'react';
import { AppShell } from './components/AppShell';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectWizard } from './pages/ProjectWizard';
import { ProjectDetail } from './pages/ProjectDetail';

type View =
  | { kind: 'list' }
  | { kind: 'new' }
  | { kind: 'detail'; projectId: string; title?: string };

function App() {
  const [view, setView] = useState<View>({ kind: 'list' });

  const handleTitle = useCallback((title: string) => {
    setView(v => (v.kind === 'detail' ? { ...v, title } : v));
  }, []);

  const breadcrumb =
    view.kind === 'new'
      ? [{ label: 'New project' }]
      : view.kind === 'detail'
      ? [{ label: view.title || 'Project' }]
      : [];

  return (
    <AppShell onHome={() => setView({ kind: 'list' })} breadcrumb={breadcrumb}>
      {view.kind === 'list' ? (
        <ProjectsPage
          onOpen={id => setView({ kind: 'detail', projectId: id })}
          onNew={() => setView({ kind: 'new' })}
        />
      ) : null}
      {view.kind === 'new' ? (
        <ProjectWizard
          onCancel={() => setView({ kind: 'list' })}
          onCreated={p => setView({ kind: 'detail', projectId: p.id, title: p.name })}
        />
      ) : null}
      {view.kind === 'detail' ? (
        <ProjectDetail projectId={view.projectId} onTitle={handleTitle} />
      ) : null}
    </AppShell>
  );
}

export default App;
