import { useEffect, type RefObject } from "react";

/** Calls `onResize` with the element's content size whenever it changes. */
export function useResizeObserver(
  ref: RefObject<HTMLElement | null>,
  onResize: (width: number, height: number) => void,
): void {
  useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === "undefined") {
      return;
    }
    const observer = new ResizeObserver(() => {
      onResize(element.clientWidth, element.clientHeight);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, onResize]);
}
