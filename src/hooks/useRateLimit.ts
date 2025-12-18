import { useState, useCallback, useRef } from 'react';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export function useRateLimit({ maxRequests, windowMs }: RateLimitConfig) {
  const [isLimited, setIsLimited] = useState(false);
  const requestTimestamps = useRef<number[]>([]);

  const checkRateLimit = useCallback((): boolean => {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Remove timestamps outside the window
    requestTimestamps.current = requestTimestamps.current.filter(
      (timestamp) => timestamp > windowStart
    );
    
    if (requestTimestamps.current.length >= maxRequests) {
      setIsLimited(true);
      setTimeout(() => setIsLimited(false), windowMs);
      return false;
    }
    
    requestTimestamps.current.push(now);
    return true;
  }, [maxRequests, windowMs]);

  const resetLimit = useCallback(() => {
    requestTimestamps.current = [];
    setIsLimited(false);
  }, []);

  return { isLimited, checkRateLimit, resetLimit };
}
