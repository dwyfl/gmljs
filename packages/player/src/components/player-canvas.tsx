import { useCallback, type ReactNode, type RefObject } from "react";
import { usePlayerController } from "../context.ts";
import { useDevicePixelSize } from "../hooks/use-device-pixel-size.ts";
import { classNames } from "../utils/class-names.ts";

export interface PlayerCanvasProps {
  /** The canvas passed to useGMLPlayer. */
  canvasRef: RefObject<HTMLCanvasElement | null>;
  className?: string;
  /** Overlays, e.g. PlayOverlay. */
  children?: ReactNode;
  /** Toggle playback when the stage is clicked. */
  clickToPlay?: boolean;
}

/**
 * The drawing surface. It follows its CSS size at the screen's pixel ratio, so it stays sharp
 * on high-density displays. A click toggles playback.
 */
export function PlayerCanvas({
  canvasRef,
  className,
  children,
  clickToPlay = true,
}: PlayerCanvasProps) {
  const controller = usePlayerController();
  const onResize = useCallback(
    (width: number, height: number) => controller.resize(width, height),
    [controller],
  );
  useDevicePixelSize(canvasRef, onResize);

  return (
    <div
      className={classNames("gmlp-stage", className)}
      onClick={clickToPlay ? () => controller.togglePlay() : undefined}
    >
      <div className="gmlp-canvas-wrap">
        <canvas ref={canvasRef} className="gmlp-canvas" />
      </div>
      {children}
    </div>
  );
}
