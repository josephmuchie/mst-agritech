import { useEffect, useRef, useState } from 'react';

export function useSSE<T>(url: string, enabled = true) {
  const [data, setData] = useState<T | null>(null);
  const [connected, setConnected] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const token = localStorage.getItem('accessToken');
    const fullUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'}${url}${token ? `?token=${token}` : ''}`;
    const es = new EventSource(fullUrl);
    esRef.current = es;

    es.onopen = () => setConnected(true);
    es.onmessage = (e) => {
      try { setData(JSON.parse(e.data)); } catch { /* ignore */ }
    };
    es.onerror = () => setConnected(false);

    return () => { es.close(); setConnected(false); };
  }, [url, enabled]);

  return { data, connected };
}
