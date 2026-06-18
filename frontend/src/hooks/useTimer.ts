import { useCallback, useEffect, useRef, useState } from 'react';

export function useTimer(initialMs: number, running: boolean) {
  const [remaining, setRemaining] = useState(initialMs);
  const remainingRef = useRef(initialMs);

  useEffect(() => {
    remainingRef.current = initialMs;
    setRemaining(initialMs);
  }, [initialMs]);

  useEffect(() => {
    if (!running) return;

    const id = window.setInterval(() => {
      remainingRef.current = Math.max(0, remainingRef.current - 1000);
      setRemaining(remainingRef.current);
    }, 1000);

    return () => clearInterval(id);
  }, [running]);

  const setTime = useCallback((ms: number) => {
    remainingRef.current = ms;
    setRemaining(ms);
  }, []);

  return { remaining, setTime, getRemaining: () => remainingRef.current };
}
