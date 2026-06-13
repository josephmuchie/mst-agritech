import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import type { IMessage } from '@stomp/stompjs';
import { getWebSocketUrl } from '../config/api';

interface UseWebSocketOptions {
  topic: string;
  onMessage: (body: string) => void;
  enabled?: boolean;
}

export function useWebSocket({ topic, onMessage, enabled = true }: UseWebSocketOptions) {
  const clientRef = useRef<Client | null>(null);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    if (!enabled || !topic) return;

    let disposed = false;
    let client: Client | null = null;

    const connect = async () => {
      try {
        const { default: SockJS } = await import('sockjs-client');
        if (disposed) return;

        const token = localStorage.getItem('accessToken');
        client = new Client({
          webSocketFactory: () => new SockJS(getWebSocketUrl()),
          connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
          reconnectDelay: 5000,
          onConnect: () => {
            client?.subscribe(topic, (msg: IMessage) => onMessageRef.current(msg.body));
          },
        });
        client.activate();
        clientRef.current = client;
      } catch {
        // WebSocket is optional — REST polling still updates notifications
      }
    };

    void connect();

    return () => {
      disposed = true;
      client?.deactivate();
      clientRef.current = null;
    };
  }, [topic, enabled]);

  return clientRef;
}
