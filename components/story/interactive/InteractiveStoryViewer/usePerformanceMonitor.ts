'use client';

import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  pageLoadTime: number;
  interactionDelay: number;
  memoryUsage?: number;
  frameRate?: number;
}

export const usePerformanceMonitor = () => {
  const metricsRef = useRef<PerformanceMetrics>({
    pageLoadTime: 0,
    interactionDelay: 0,
  });

  const interactionStartRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);
  const animationFrameId = useRef<number>();

  const measureFrameRate = () => {
    const now = performance.now();
    frameCountRef.current++;

    if (now - lastFrameTimeRef.current >= 1000) {
      metricsRef.current.frameRate = frameCountRef.current;
      frameCountRef.current = 0;
      lastFrameTimeRef.current = now;
    }

    animationFrameId.current = requestAnimationFrame(measureFrameRate);
  };

  const trackInteractionStart = () => {
    interactionStartRef.current = performance.now();
  };

  const trackInteractionEnd = () => {
    if (interactionStartRef.current) {
      const delay = performance.now() - interactionStartRef.current;
      metricsRef.current.interactionDelay = delay;
      interactionStartRef.current = 0;
    }
  };

  const getMemoryUsage = () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      metricsRef.current.memoryUsage = memory.usedJSHeapSize / (1024 * 1024); // MB
    }
  };

  useEffect(() => {
    // Measure initial page load time
    const loadTime = performance.now();
    metricsRef.current.pageLoadTime = loadTime;

    // Start measuring frame rate
    lastFrameTimeRef.current = performance.now();
    animationFrameId.current = requestAnimationFrame(measureFrameRate);

    // Set up periodic memory usage checks
    const memoryInterval = setInterval(getMemoryUsage, 5000);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      clearInterval(memoryInterval);
    };
  }, []);

  return {
    getMetrics: () => ({ ...metricsRef.current }),
    trackInteractionStart,
    trackInteractionEnd,
  };
};
