import { useRef } from "react";

export function useRateLimit(calls = 1, perMs = 1000) {
  const lastRef = useRef<number[]>([]);

  function canCall() {
    const now = Date.now();
    lastRef.current = lastRef.current.filter((t) => now - t < perMs);
    if (lastRef.current.length < calls) {
      lastRef.current.push(now);
      return true;
    }
    return false;
  }

  return { canCall };
}
