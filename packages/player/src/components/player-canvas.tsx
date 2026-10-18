import { useCallback, type ReactNode, type RefObject } from "react";
import { usePlayerController } from "../context.ts";
import { useResizeObserver } from "../hooks/use-resize-observer.ts";
import { classNames } from "../class-names.ts";

export interface PlayerCanvasProps {
  /** The canvas passed to useGMLPlayer. */
  canvasRef: RefObject<HTMLCanvasElement | null>;
  className?: string;
  /** Overlays, e.g. PlayOverlay. */
  children?: ReactNode;
}

/** The drawing surface. It follows its CSS size, and a click toggles playback. */
export function PlayerCanvas({ canvasRef, className, children }: PlayerCanvasProps) {
  const controller = usePlayerController();
  const onResize = useCallback(
    (width: number, height: number) => controller.resize(width, height),
    [controller],
  );
  useResizeObserver(canvasRef, onResize);

  return (
    <div className={classNames("gmlp-stage", className)} onClick={() => controller.togglePlay()}>
      <div className="gmlp-canvas-wrap">
        <canvas ref={canvasRef} className="gmlp-canvas" />
      </div>
      {children}
    </div>
  );
}
