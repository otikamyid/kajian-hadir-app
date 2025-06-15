
import { useState, useCallback, useRef, useEffect } from 'react';
import { logger } from '@/utils/logger';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export interface AsyncStateActions<T> {
  execute: (...args: any[]) => Promise<void>;
  reset: () => void;
  setData: (data: T | null) => void;
  setError: (error: Error | null) => void;
}

export function useAsyncState<T = any>(
  asyncFunction: (...args: any[]) => Promise<T>,
  initialData: T | null = null
): AsyncState<T> & AsyncStateActions<T> {
  const [state, setState] = useState<AsyncState<T>>({
    data: initialData,
    loading: false,
    error: null,
  });

  const cancelRef = useRef<AbortController | null>(null);

  const execute = useCallback(async (...args: any[]) => {
    // Cancel previous request if still pending
    if (cancelRef.current) {
      cancelRef.current.abort();
    }

    cancelRef.current = new AbortController();
    const { signal } = cancelRef.current;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      logger.debug('Async operation started');
      const result = await asyncFunction(...args);
      
      if (!signal.aborted) {
        setState({ data: result, loading: false, error: null });
        logger.debug('Async operation completed successfully');
      }
    } catch (error) {
      if (!signal.aborted) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        setState(prev => ({ ...prev, loading: false, error: errorObj }));
        logger.error('Async operation failed', { error: errorObj.message });
      }
    }
  }, [asyncFunction]);

  const reset = useCallback(() => {
    if (cancelRef.current) {
      cancelRef.current.abort();
    }
    setState({ data: initialData, loading: false, error: null });
  }, [initialData]);

  const setData = useCallback((data: T | null) => {
    setState(prev => ({ ...prev, data }));
  }, []);

  const setError = useCallback((error: Error | null) => {
    setState(prev => ({ ...prev, error, loading: false }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cancelRef.current) {
        cancelRef.current.abort();
      }
    };
  }, []);

  return {
    ...state,
    execute,
    reset,
    setData,
    setError,
  };
}

// Hook for managing multiple async operations
export function useAsyncOperations() {
  const [operations, setOperations] = useState<Map<string, AsyncState<any>>>(new Map());

  const addOperation = useCallback(<T>(
    key: string,
    asyncFunction: (...args: any[]) => Promise<T>,
    initialData?: T
  ) => {
    const { execute, reset, setData, setError, ...state } = useAsyncState(asyncFunction, initialData);
    
    setOperations(prev => new Map(prev.set(key, state)));
    
    return { execute, reset, setData, setError };
  }, []);

  const getOperation = useCallback((key: string) => {
    return operations.get(key) || { data: null, loading: false, error: null };
  }, [operations]);

  const removeOperation = useCallback((key: string) => {
    setOperations(prev => {
      const newMap = new Map(prev);
      newMap.delete(key);
      return newMap;
    });
  }, []);

  return {
    addOperation,
    getOperation,
    removeOperation,
    operations: Array.from(operations.entries()),
  };
}
