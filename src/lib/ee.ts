// Google Earth Engine JavaScript client wrapper
// Loaded via <script src="/ee_api_js_npm.js"> which sets window.ee

/* eslint-disable @typescript-eslint/no-explicit-any */
const ee = (typeof window !== 'undefined' ? (window as any).ee : null) as typeof import('@google/earthengine');
/* eslint-enable @typescript-eslint/no-explicit-any */

export default ee;

export const GCP_PROJECT = 'api-project-48442550024';

// OAuth 2.0 Web Client ID — registered in Google Cloud Console
export const OAUTH_CLIENT_ID =
  (import.meta.env.VITE_GEE_OAUTH_CLIENT_ID as string) || '';

export type EEAuthState = 'idle' | 'authenticating' | 'ready' | 'error';
