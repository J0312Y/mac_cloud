/**
 * Mac Build Cloud — useSocket React Hook
 * ───────────────────────────────────────
 * Drop into src/hooks/useSocket.js
 *
 * npm install socket.io-client
 *
 * Usage:
 *   const { connected, subscribeBuild, on, off } = useSocket();
 *
 *   // Subscribe to a specific build
 *   useEffect(() => {
 *     subscribeBuild(buildId);
 *     on('buildUpdate', (data) => console.log(data));
 *     on('logLine',     (data) => setLogs(l => [...l, data]));
 *     return () => off('buildUpdate');
 *   }, [buildId]);
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { getToken } from './api';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '')
  || 'http://localhost:3001';

let _socket = null;
let _refCount = 0;

function getSocket() {
  if (!_socket) {
    _socket = io(SOCKET_URL, {
      auth:             { token: getToken() },
      transports:       ['websocket', 'polling'],
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });
  }
  return _socket;
}

export function useSocket() {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;
    _refCount++;

    const onConnect    = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    socket.on('connect',    onConnect);
    socket.on('disconnect', onDisconnect);
    if (socket.connected) setConnected(true);

    return () => {
      socket.off('connect',    onConnect);
      socket.off('disconnect', onDisconnect);
      _refCount--;
      // Don't disconnect — shared across components
    };
  }, []);

  const subscribeBuild = useCallback((buildId) => {
    socketRef.current?.emit('subscribeBuild', buildId);
  }, []);

  const unsubscribeBuild = useCallback((buildId) => {
    socketRef.current?.emit('unsubscribeBuild', buildId);
  }, []);

  const subscribeAdmin = useCallback(() => {
    socketRef.current?.emit('subscribeAdmin');
  }, []);

  const on  = useCallback((event, cb) => socketRef.current?.on(event, cb),  []);
  const off = useCallback((event, cb) => socketRef.current?.off(event, cb), []);

  return { connected, subscribeBuild, unsubscribeBuild, subscribeAdmin, on, off };
}

// ── Convenience hook: live updates for a single build ────────────────────────
export function useBuildUpdates(buildId, onUpdate, onLog) {
  const { connected, subscribeBuild, unsubscribeBuild, on, off } = useSocket();

  useEffect(() => {
    if (!buildId) return;

    subscribeBuild(buildId);

    const handleUpdate = (data) => {
      if (data.id === buildId && onUpdate) onUpdate(data);
    };
    const handleLog = (data) => {
      if (data.buildId === buildId && onLog) onLog(data);
    };

    on('buildUpdate', handleUpdate);
    on('logLine',     handleLog);

    return () => {
      off('buildUpdate', handleUpdate);
      off('logLine',     handleLog);
      unsubscribeBuild(buildId);
    };
  }, [buildId]);

  return { connected };
}

// ── Convenience hook: queue state ─────────────────────────────────────────────
export function useQueueUpdates(onQueueUpdate) {
  const { on, off } = useSocket();

  useEffect(() => {
    if (!onQueueUpdate) return;
    on('queueUpdate', onQueueUpdate);
    return () => off('queueUpdate', onQueueUpdate);
  }, [onQueueUpdate]);
}

export default useSocket;
