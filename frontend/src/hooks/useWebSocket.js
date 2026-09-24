import { useState, useEffect, useRef, useCallback } from 'react';
import { WS_URL } from '../services/api';
import { INITIAL_BUSES } from '../data/mockData';
import { BUS_ROUTES } from '../data/routesData';

export function useWebSocket(onMessageReceived) {
  const [isConnected, setIsConnected] = useState(false);
  const [isSimulated, setIsSimulated] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const simIntervalRef = useRef(null);
  const isRealWsActiveRef = useRef(false);

  // Simulation state for 5 buses
  const simStateRef = useRef(
    INITIAL_BUSES.map((b) => {
      const route = BUS_ROUTES.find((r) => r.id === b.id) || BUS_ROUTES[0];
      return {
        ...b,
        routeCoords: route.coordinates,
        currentIndex: 0,
        direction: 1
      };
    })
  );

  // Start offline / static simulation ticker
  const startSimulation = useCallback(() => {
    if (simIntervalRef.current) return;
    setIsSimulated(true);
    setIsConnected(true);

    simIntervalRef.current = setInterval(() => {
      if (isRealWsActiveRef.current) return;

      const updated = simStateRef.current.map((bus) => {
        const coords = bus.routeCoords;
        if (!coords || coords.length === 0) return bus;

        let nextIdx = bus.currentIndex + bus.direction;
        let nextDir = bus.direction;

        if (nextIdx >= coords.length) {
          nextIdx = coords.length - 2;
          nextDir = -1;
        } else if (nextIdx < 0) {
          nextIdx = 1;
          nextDir = 1;
        }

        const [lat, lng] = coords[nextIdx] || coords[0];
        const prevCoord = coords[bus.currentIndex] || coords[0];
        
        // Calculate heading
        const dLat = lat - prevCoord[0];
        const dLng = lng - prevCoord[1];
        const heading = Math.round((Math.atan2(dLng, dLat) * 180 / Math.PI + 360) % 360);
        const speed = Math.floor(22 + Math.random() * 16);

        return {
          ...bus,
          lat,
          lng,
          heading,
          speed,
          currentIndex: nextIdx,
          direction: nextDir,
          last_updated: new Date().toISOString()
        };
      });

      simStateRef.current = updated;
      const payload = { type: 'bus_telemetry', data: updated };
      setLastMessage(payload);
      if (onMessageReceived) {
        onMessageReceived(payload);
      }
    }, 2500);
  }, [onMessageReceived]);

  const stopSimulation = useCallback(() => {
    if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current);
      simIntervalRef.current = null;
    }
    setIsSimulated(false);
  }, []);

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        isRealWsActiveRef.current = true;
        stopSimulation();
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
        isRealWsActiveRef.current = false;
        // Start simulation when real WebSocket is disconnected
        startSimulation();
        // Attempt reconnect to real WS after 6 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 6000);
      };

      ws.onerror = () => {
        ws.close();
      };

      wsRef.current = ws;
    } catch {
      isRealWsActiveRef.current = false;
      startSimulation();
      reconnectTimeoutRef.current = setTimeout(connect, 6000);
    }
  }, [onMessageReceived, startSimulation, stopSimulation]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      stopSimulation();
      if (wsRef.current) wsRef.current.close();
    };
  }, [connect, stopSimulation]);

  const sendMessage = useCallback((msg) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  }, []);

  return { isConnected, isSimulated, lastMessage, sendMessage };
}
