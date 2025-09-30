import { useRef, useEffect, useCallback } from 'react';

    export function useDebouncedCallback(callback, delay) {
      const callbackRef = useRef(callback);
      const timeoutRef = useRef(null);

      useEffect(() => {
        callbackRef.current = callback;
      }, [callback]);

      useEffect(() => {
        return () => {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
        };
      }, []);

      return useCallback((...args) => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          callbackRef.current(...args);
        }, delay);
      }, [delay]);
    }