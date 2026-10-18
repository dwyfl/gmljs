import { useEffect, useRef, useState, type RefObject } from "react";
import type { GML, RenderOptions } from "@gmljs/render";
import { PlayerController, type CreateViewFn } from "../player-controller.ts";

export interface UseGMLPlayerOptions {
  gml: string | GML;
  autoPlay?: boolean;
  defaultLoop?: boolean;
  speed?: number;
  renderOptions?: Partial<RenderOptions>;
  createView?: CreateViewFn;
}

const DEFAULT_WIDTH = 640;
const DEFAULT_HEIGHT = 480;

/**
 * Creates a PlayerController and attaches it to the canvas while mounted. Changes to `gml`,
 * `speed` and `renderOptions` are applied to the running view.
 */
export function useGMLPlayer(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  {
    gml,
    autoPlay = false,
    defaultLoop = true,
    speed = 1,
    renderOptions,
    createView,
  }: UseGMLPlayerOptions,
): PlayerController {
  const [controller] = useState(
    () => new PlayerController({ loop: defaultLoop, speed, renderOptions, createView }),
  );

  // The latest gml and autoPlay, read when (re)attaching without re-running the effect.
  const initial = useRef({ gml, autoPlay });
  useEffect(() => {
    initial.current = { gml, autoPlay };
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    controller.attach(
      canvas,
      initial.current.gml,
      canvas.clientWidth || DEFAULT_WIDTH,
      canvas.clientHeight || DEFAULT_HEIGHT,
    );
    if (initial.current.autoPlay) {
      controller.play();
    }
    return () => controller.detach();
  }, [controller, canvasRef]);

  useEffect(() => {
    controller.setGml(gml);
  }, [controller, gml]);

  useEffect(() => {
    controller.setSpeed(speed);
  }, [controller, speed]);

  useEffect(() => {
    if (renderOptions) {
      controller.setRenderOptions(renderOptions);
    }
  }, [controller, renderOptions]);

  return controller;
}
