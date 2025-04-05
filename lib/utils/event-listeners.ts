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
