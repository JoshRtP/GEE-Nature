import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { EarthEngineProvider } from './lib/useEarthEngine.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <EarthEngineProvider>
      <App />
    </EarthEngineProvider>
  </StrictMode>
);
