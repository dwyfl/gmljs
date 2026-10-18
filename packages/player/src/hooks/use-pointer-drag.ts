import { useCallback, useRef, type PointerEvent as ReactPointerEvent } from "react";

export interface PointerDragHandlers {
  onStart?: (event: ReactPointerEvent<HTMLElement>) => void;
  onMove?: (event: ReactPointerEvent<HTMLElement>) => void;
  onEnd?: (event: ReactPointerEvent<HTMLElement>) => void;
}

/**
 * Pointer handlers for dragging on an element. Pointer capture keeps the drag going outside
 * the element, for mouse, touch and pen alike.
 */
export function usePointerDrag({ onStart, onMove, onEnd }: PointerDragHandlers) {
  const pointerId = useRef<number | null>(null);

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (event.button !== 0 || pointerId.current !== null) {
        return;
      }
      pointerId.current = event.pointerId;
      event.currentTarget.setPointerCapture?.(event.pointerId);
      event.preventDefault();
      onStart?.(event);
      onMove?.(event);
    },
    [onStart, onMove],
  );

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (event.pointerId === pointerId.current) {
        onMove?.(event);
      }
    },
    [onMove],
  );

  const onPointerEnd = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (event.pointerId !== pointerId.current) {
        return;
      }
      pointerId.current = null;
      event.currentTarget.releasePointerCapture?.(event.pointerId);
      onEnd?.(event);
    },
    [onEnd],
  );

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp: onPointerEnd,
    onPointerCancel: onPointerEnd,
  };
}
