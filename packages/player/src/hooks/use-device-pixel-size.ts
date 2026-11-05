import { useEffect, type RefObject } from "react";
import { getPixelRatio, toDevicePixels } from "../utils/pixel-ratio.ts";

/**
 * Calls `onResize` with the element's content size in device pixels whenever it changes,
 * including when the pixel ratio changes (browser zoom, or moving to another display).
 */
export function useDevicePixelSize(
  ref: RefObject<HTMLElement | null>,
  onResize: (width: number, height: number) => void,
): void {
  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const measure = (entry?: ResizeObserverEntry) => {
      // Exact device pixels where supported (Chrome, Firefox), else CSS size × pixel ratio.
      const box = entry?.devicePixelContentBoxSize?.[0];
      if (box) {
        onResize(box.inlineSize, box.blockSize);
      } else {
        const ratio = getPixelRatio();
        onResize(
          toDevicePixels(element.clientWidth, ratio),
          toDevicePixels(element.clientHeight, ratio),
        );
      }
    };

    let observer: ResizeObserver | undefined;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver((entries) => measure(entries[entries.length - 1]));
      try {
        observer.observe(element, { box: "device-pixel-content-box" });
      } catch {
        // Safari doesn't support observing device pixels.
        observer.observe(element);
      }
    }

    // A media query for the current ratio stops matching when the ratio changes.
    let query: MediaQueryList | undefined;
    const onRatioChange = () => {
      measure();
      watchRatio();
    };
    const watchRatio = () => {
      query?.removeEventListener("change", onRatioChange);
      query = window.matchMedia?.(`(resolution: ${getPixelRatio()}dppx)`);
      query?.addEventListener("change", onRatioChange);
    };
    watchRatio();

    return () => {
      observer?.disconnect();
      query?.removeEventListener("change", onRatioChange);
    };
  }, [ref, onResize]);
}
