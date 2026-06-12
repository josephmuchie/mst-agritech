import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import type { IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

interface UseWebSocketOptions {
  topic: string;
  onMessage: (body: string) => void;
  enabled?: boolean;
}

export function useWebSocket({ topic, onMessage, enabled = true }: UseWebSocketOptions) {
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const token = localStorage.getItem('accessToken');
    const client = new Client({
      webSocketFactory: () => new SockJS(`${import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:8080'}/ws`),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(topic, (msg: IMessage) => onMessage(msg.body));
      },
    });
    client.activate();
    clientRef.current = client;
    return () => { client.deactivate(); };
  }, [topic, enabled]);

  return clientRef;
}
