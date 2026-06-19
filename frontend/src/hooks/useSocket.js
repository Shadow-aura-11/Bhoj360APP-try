import { useState, useEffect, useRef } from 'react';
import { createSocket } from '../api/client';

export function useSocket(tenantId) {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!tenantId) return;
    const socket = createSocket(tenantId);
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('connect_error', () => {
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [tenantId]);

  return { socket: socketRef.current, isConnected };
}
