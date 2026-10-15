import { deflate as zlibDeflate } from "node:zlib";
import { Canvas as CoreCanvas, type CanvasOptions } from "./canvas/canvas.ts";
import type { Deflate } from "./encode/png.ts";

const nodeDeflate: Deflate = (data) =>
  new Promise((resolve, reject) => {
    zlibDeflate(data, (error, output) => {
      if (error) {
        reject(error);
      } else {
        resolve(output);
      }
    });
  });

export class Canvas extends CoreCanvas {
  constructor(width: number, height: number, options: CanvasOptions = {}) {
    super(width, height, { deflate: options.deflate ?? nodeDeflate });
  }
}

export { CanvasRenderingContext2D } from "./canvas/context-2d.ts";
export type { CanvasOptions, EncodeOptions } from "./canvas/canvas.ts";
export type { Deflate } from "./encode/png.ts";
export type { FillRule } from "./path/path.ts";
export type { LineCap, LineJoin } from "./stroke/stroker.ts";
