import { Canvas } from "skia-canvas";

/**
 * Creates a skia-canvas canvas that uses Skia's CPU rasterizer. skia-canvas renders on the
 * GPU when one is available, and GPU anti-aliasing differs noticeably from the CPU output
 * that every reference threshold and recorded baseline was measured against.
 */
export function createSkiaCanvas(width: number, height: number): Canvas {
  const canvas = new Canvas(width, height);
  canvas.gpu = false;
  return canvas;
}
