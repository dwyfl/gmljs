import { resolveImageOptions, type RenderImageOptions } from "../../render/context.ts";
import { RenderContextCanvas2D } from "./base.ts";

export class RenderContextHtmlCanvas extends RenderContextCanvas2D<HTMLCanvasElement> {
  constructor(canvas: string);
  constructor(canvas: HTMLCanvasElement);
  constructor(width: number, height: number);
  constructor(canvasOrWidth: string | HTMLCanvasElement | number, height?: number) {
    let canvas: HTMLCanvasElement;
    if (typeof canvasOrWidth === "string") {
      const canvasEl = document.getElementById(canvasOrWidth);
      if (!(canvasEl instanceof HTMLCanvasElement)) {
        throw new Error(`Invalid canvas id ${canvasOrWidth}`);
      }
      canvas = canvasEl;
    } else if (canvasOrWidth instanceof HTMLCanvasElement) {
      canvas = canvasOrWidth;
    } else {
      canvas = document.createElement("canvas");
      canvas.width = canvasOrWidth;
      canvas.height = height!;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to get canvas 2D context.");
    }
    super(canvas, ctx);
  }

  async renderToDataURL(options?: RenderImageOptions): Promise<string> {
    const { format, quality } = resolveImageOptions(options);
    return this.canvas.toDataURL(`image/${format}`, quality);
  }

  async renderToBlob(options?: RenderImageOptions): Promise<Blob> {
    const { format, quality } = resolveImageOptions(options);
    return new Promise((resolve, reject) => {
      this.canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Failed to create blob."))),
        `image/${format}`,
        quality,
      );
    });
  }
}
