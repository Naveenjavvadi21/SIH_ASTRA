import { useState, useEffect, useRef, useCallback } from 'react';
import { WS_URL } from '../services/api';

export function useWebSocket(onMessageReceived) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
          if (onMessageReceived) {
            onMessageReceived(data);
          }
        } catch (e) {
          console.error("Failed to parse websocket JSON message", e);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        // Attempt reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };

      ws.onerror = (err) => {
        console.warn("WebSocket connection error, reconnecting soon...", err);
        ws.close();
      };

      wsRef.current = ws;
    } catch (err) {
      console.error("WebSocket setup error", err);
      reconnectTimeoutRef.current = setTimeout(connect, 3000);
    }
  }, [onMessageReceived]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [connect]);

  const sendMessage = useCallback((msg) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  }, []);

  return { isConnected, lastMessage, sendMessage };
}
