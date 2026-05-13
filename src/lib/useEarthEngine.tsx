import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import ee, { GCP_PROJECT, OAUTH_CLIENT_ID, type EEAuthState } from './ee';

interface EEContext {
  state: EEAuthState;
  error: string | null;
  userEmail: string | null;
  login: () => void;
  logout: () => void;
}

const Context = createContext<EEContext>({
  state: 'idle',
  error: null,
  userEmail: null,
  login: () => {},
  logout: () => {},
});

const EE_SCOPES = [
  'https://www.googleapis.com/auth/earthengine',
  'https://www.googleapis.com/auth/cloud-platform',
  'https://www.googleapis.com/auth/drive',
].join(' ');

// Stable redirect URI hosted on Supabase — never changes, so it can be registered
// once in the Google Cloud Console OAuth client's authorized redirect URIs.
const OAUTH_REDIRECT_URI = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/oauth-callback`;

// Opens the OAuth2 implicit-grant flow in a real top-level popup.
// The popup lands on the Supabase edge function which reads the token from the
// URL fragment client-side and postMessages it back to the opener.
function openOAuthPopup(clientId: string): Promise<{ access_token: string; token_type: string; expires_in: number }> {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: OAUTH_REDIRECT_URI,
      response_type: 'token',
      scope: EE_SCOPES,
      prompt: 'select_account',
    });

    const url = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
    const popup = window.open(url, 'gee_oauth', 'width=500,height=600,left=200,top=100');

    if (!popup) {
      reject(new Error('Popup was blocked. Please allow popups for this site and try again.'));
      return;
    }

    const onMessage = (event: MessageEvent) => {
      if (event.data?.type !== 'oauth_callback') return;
      cleanup();
      if (event.data.error) {
        reject(new Error(event.data.error));
      } else if (event.data.access_token) {
        resolve({
          access_token: event.data.access_token,
          token_type: event.data.token_type ?? 'Bearer',
          expires_in: Number(event.data.expires_in ?? 3600),
        });
      } else {
        reject(new Error('No token received.'));
      }
    };

    window.addEventListener('message', onMessage);

    const poll = setInterval(() => {
      if (popup.closed) {
        cleanup();
        reject(new Error('Login cancelled.'));
      }
    }, 500);

    function cleanup() {
      clearInterval(poll);
      window.removeEventListener('message', onMessage);
      try { popup.close(); } catch { /* ignore */ }
    }
  });
}

export function EarthEngineProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<EEAuthState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const onSuccess = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const eeRef = (window as any).ee ?? ee;

    let settled = false;
    const timeout = setTimeout(() => {
      if (!settled) {
        settled = true;
        setState('error');
        setError(
          'Earth Engine timed out during initialization. ' +
          'Make sure the Earth Engine API is enabled for project ' + GCP_PROJECT +
          ' and your account has access.'
        );
      }
    }, 15000);

    eeRef.initialize(
      null, null,
      () => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        setState('ready');
      },
      (initErr: unknown) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        setState('error');
        setError(String(initErr));
      },
      null,
      GCP_PROJECT,
    );
  }, []);

  const login = useCallback(() => {
    if (!OAUTH_CLIENT_ID) {
      setState('error');
      setError('VITE_GEE_OAUTH_CLIENT_ID is not set. Add it to your .env file.');
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const eeRef = (window as any).ee ?? ee;
    if (!eeRef?.data) {
      setState('error');
      setError('Earth Engine script did not load. Try refreshing the page.');
      return;
    }
    setState('authenticating');
    setError(null);

    openOAuthPopup(OAUTH_CLIENT_ID)
      .then((token) => {
        // Feed the token directly into EE — bypasses GIS entirely
        eeRef.data.setAuthToken(
          OAUTH_CLIENT_ID,
          token.token_type,
          token.access_token,
          token.expires_in,
          EE_SCOPES.split(' '),
          null,
          false,
        );
        onSuccess();
      })
      .catch((err: Error) => {
        if (err.message === 'Login cancelled.') {
          setState('idle');
          setError(null);
        } else {
          setState('error');
          setError(err.message);
        }
      });
  }, [onSuccess]);

  const logout = useCallback(() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((window as any).ee ?? ee).reset();
    } catch { /* ignore */ }
    setState('idle');
    setError(null);
    setUserEmail(null);
  }, []);

  return (
    <Context.Provider value={{ state, error, userEmail, login, logout }}>
      {children}
    </Context.Provider>
  );
}

function useEarthEngine() {
  return useContext(Context);
}

export { useEarthEngine };
