
import { useEffect, useRef, useCallback } from 'react';
import { logger, PerformanceMonitor } from '@/utils/logger';

// Hook for measuring component render performance
export function useRenderPerformance(componentName: string) {
  const renderCount = useRef(0);
  const mountTime = useRef<number>(0);

  useEffect(() => {
    mountTime.current = performance.now();
    logger.debug(`Component ${componentName} mounted`);

    return () => {
      const unmountTime = performance.now();
      const totalTime = unmountTime - mountTime.current;
      logger.debug(`Component ${componentName} unmounted after ${totalTime.toFixed(2)}ms`, {
        component: componentName,
        totalMountTime: totalTime,
        renderCount: renderCount.current
      });
    };
  }, [componentName]);

  useEffect(() => {
    renderCount.current++;
    logger.debug(`Component ${componentName} rendered (count: ${renderCount.current})`);
  });

  return {
    renderCount: renderCount.current,
    measureOperation: useCallback((label: string, fn: () => void) => {
      PerformanceMonitor.measure(`${componentName}.${label}`, fn);
    }, [componentName])
  };
}

// Hook for measuring async operations
export function useAsyncPerformance() {
  const measureAsync = useCallback(async <T>(
    label: string,
    operation: () => Promise<T>
  ): Promise<T> => {
    return PerformanceMonitor.measureAsync(label, operation);
  }, []);

  const measure = useCallback(<T>(
    label: string,
    operation: () => T
  ): T => {
    return PerformanceMonitor.measure(label, operation);
  }, []);

  return { measureAsync, measure };
}

// Export a combined hook for convenience
export function usePerformance() {
  return useAsyncPerformance();
}

// Hook for tracking page load performance
export function usePagePerformance(pageName: string) {
  useEffect(() => {
    const startTime = performance.now();
    
    const measureTTI = () => {
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      logger.info(`Page ${pageName} loaded`, {
        page: pageName,
        loadTime,
        timestamp: new Date().toISOString()
      });
    };

    const timer = setTimeout(measureTTI, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [pageName]);
}

// Hook for memory usage monitoring
export function useMemoryMonitoring(intervalMs: number = 30000) {
  useEffect(() => {
    if (!('memory' in performance)) {
      logger.debug('Memory monitoring not supported in this browser');
      return;
    }

    const checkMemory = () => {
      const memory = (performance as any).memory;
      if (memory) {
        const memoryInfo = {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
          usagePercentage: ((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100).toFixed(2)
        };

        logger.debug('Memory usage', memoryInfo);

        if (parseFloat(memoryInfo.usagePercentage) > 80) {
          logger.warn('High memory usage detected', memoryInfo);
        }
      }
    };

    checkMemory();
    const interval = setInterval(checkMemory, intervalMs);

    return () => {
      clearInterval(interval);
    };
  }, [intervalMs]);
}
