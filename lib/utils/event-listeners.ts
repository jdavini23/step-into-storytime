import * as React from 'react';

/**
 * Add a passive event listener to improve scrolling performance
 */
export const addPassiveEventListener = (
  element: Element | Window,
  eventName: string,
  handler: EventListenerOrEventListenerObject,
  options: AddEventListenerOptions = {}
) => {
  const defaultOptions: AddEventListenerOptions = {
    passive: true,
    ...options,
  };

  element.addEventListener(eventName, handler, defaultOptions);
  return () => element.removeEventListener(eventName, handler);
};

/**
 * Add a passive event listener to a React ref
 */
export const usePassiveEventListener = (
  ref: React.RefObject<Element>,
  eventName: string,
  handler: EventListenerOrEventListenerObject,
  options: AddEventListenerOptions = {},
  deps: React.DependencyList = []
) => {
  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const defaultOptions: AddEventListenerOptions = {
      passive: true,
      ...options,
    };

    element.addEventListener(eventName, handler, defaultOptions);
    return () => element.removeEventListener(eventName, handler);
  }, [ref, eventName, handler, ...deps]);
};
