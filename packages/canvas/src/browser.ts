import { Canvas as CoreCanvas, type CanvasOptions } from "./canvas/canvas.ts";
import type { Deflate } from "./encode/png.ts";

const browserDeflate: Deflate = async (data) => {
  const copy = new Uint8Array(data.length);
  copy.set(data);
  const stream = new Blob([copy.buffer]).stream().pipeThrough(new CompressionStream("deflate"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
};

export class Canvas extends CoreCanvas {
  constructor(width: number, height: number, options: CanvasOptions = {}) {
    super(width, height, { deflate: options.deflate ?? browserDeflate });
  }
}

export { CanvasRenderingContext2D } from "./canvas/context-2d.ts";
export type { CanvasOptions, EncodeOptions } from "./canvas/canvas.ts";
export type { Deflate } from "./encode/png.ts";
export type { ChromaSubsampling } from "./encode/jpeg.ts";
export type { FillRule } from "./path/path.ts";
export type { LineCap, LineJoin } from "./stroke/stroker.ts";
