import { useCallback, useEffect, useState, type RefObject } from "react";

/** Fullscreen state and toggle for one element (not the whole document). */
export function useFullscreen(ref: RefObject<HTMLElement | null>) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () => {
      setIsFullscreen(
        document.fullscreenElement !== null && document.fullscreenElement === ref.current,
      );
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, [ref]);

  const toggle = useCallback(() => {
    const element = ref.current;
    if (!element) {
      return;
    }
    if (document.fullscreenElement === element) {
      void document.exitFullscreen();
    } else {
      void element.requestFullscreen?.();
    }
  }, [ref]);

  return { isFullscreen, toggle };
}
