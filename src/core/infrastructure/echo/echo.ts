import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { getToken } from '../auth/authStorage';

let echoInstance: Echo<'pusher'> | null = null;

export const createEcho = (): Echo<'pusher'> => {
  if (echoInstance) return echoInstance;

  (window as any).Pusher = Pusher;

  const token = getToken();

  echoInstance = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_REVERB_APP_KEY ?? 'ha-st-k',
    wsHost: import.meta.env.VITE_REVERB_HOST ?? 'ws.stage-erp-api.marka-tech.com',
    wsPort: import.meta.env.VITE_REVERB_PORT ?? 443,
    wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
    cluster: import.meta.env.VITE_REVERB_CLUSTER ?? 'mt1',
    wsPath: '',
    forceTLS: true,
    encrypted: true,
    disableStats: true,
    enabledTransports: ['ws', 'wss'],
    authEndpoint: `${import.meta.env.VITE_PUBLIC_API_URL?.replace('/api/v1', '')}/broadcasting/auth`,
    auth: {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  });

  (echoInstance.connector.pusher.connection as any).bind('state_change', (states: { previous?: string; current: string }) => {
    console.log(`[echo] connection: ${states.previous ?? 'init'} -> ${states.current}`);
  });

  return echoInstance;
};

export const destroyEcho = (): void => {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
  }
};
