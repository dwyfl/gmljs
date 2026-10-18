import { useEffect, useRef, useSyncExternalStore } from "react";
import type { GMLView } from "@gmljs/render";
import { usePlayerController } from "../context.ts";
import { classNames } from "../class-names.ts";

export interface SeekbarPreviewProps {
  /** The hovered position, 0..1. */
  position: number;
  /** Width of the seekbar in pixels; the preview stays inside it. */
  trackWidth: number;
  /** Hidden previews keep their view, so showing them again is instant. */
  visible?: boolean;
  /** Preview width in pixels; the height follows the player's aspect ratio. */
  width?: number;
  className?: string;
}

const DEFAULT_ASPECT = 3 / 4;

/**
 * A thumbnail of the drawing at the hovered seekbar position. It renders with its own view on
 * a small canvas, sharing the player's parsed document and render options.
 */
export function SeekbarPreview({
  position,
  trackWidth,
  visible = true,
  width = 160,
  className,
}: SeekbarPreviewProps) {
  const controller = usePlayerController();
  const gml = useSyncExternalStore(
    controller.subscribe,
    () => controller.view?.gml ?? null,
    () => null,
  );
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewRef = useRef<GMLView | null>(null);
  const positionRef = useRef(position);
  const drawRequest = useRef<number | null>(null);

  const mainContext = controller.view?.renderContext;
  const aspect =
    mainContext && mainContext.width > 0 ? mainContext.height / mainContext.width : DEFAULT_ASPECT;
  const height = Math.max(1, Math.round(width * aspect));

  // One view per document, created on the preview's canvas.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !gml) {
      return;
    }
    const view = controller.createView(gml, {
      type: "html-canvas",
      canvas,
      width,
      height,
      ...controller.renderOptions,
    });
    viewRef.current = view;
    return () => {
      if (drawRequest.current !== null) {
        cancelAnimationFrame(drawRequest.current);
        drawRequest.current = null;
      }
      view.unload();
      viewRef.current = null;
    };
    // The size is applied by the effect below; recreating the view for it is unnecessary.
    // oxlint-disable-next-line react/exhaustive-deps
  }, [controller, gml]);

  useEffect(() => {
    viewRef.current?.setSize(width, height);
  }, [width, height]);

  // Draw at most once per frame, at the latest hovered position.
  useEffect(() => {
    positionRef.current = position;
    if (!visible || drawRequest.current !== null) {
      return;
    }
    drawRequest.current = requestAnimationFrame(() => {
      drawRequest.current = null;
      const view = viewRef.current;
      if (view) {
        view.setPosition(positionRef.current);
        view.draw();
      }
    });
  }, [position, visible, width, height]);

  const half = width / 2;
  const left = Math.max(half, Math.min(trackWidth - half, position * trackWidth));

  return (
    <div
      className={classNames("gmlp-preview", !visible && "gmlp-preview--hidden", className)}
      style={{ left }}
      aria-hidden
    >
      <canvas ref={canvasRef} className="gmlp-preview-canvas" style={{ width, height }} />
    </div>
  );
}
