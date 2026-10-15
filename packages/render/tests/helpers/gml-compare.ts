import { fileURLToPath } from "node:url";
import type {
  Canvas as SkiaCanvas,
  CanvasRenderingContext2D as SkiaCanvasRenderingContext2D,
} from "skia-canvas";
import { GMLView } from "../../src/view.ts";
import { GMLRenderer } from "../../src/render/index.ts";
import { RenderContextBase, type RenderImageOptions } from "../../src/render/context.ts";
import { applyRenderProps, type RenderProps } from "../../src/render/props/index.ts";
import { createSkiaCanvas } from "./skia.ts";

/**
 * The accuracy reference: skia-canvas pinned to Skia's CPU rasterizer (unlike
 * RenderContextSkiaCanvas, which may render on the GPU), with access to the raw pixels.
 */
export class RenderContextSkiaReference extends RenderContextBase {
  private readonly canvas: SkiaCanvas;
  private readonly ctx: SkiaCanvasRenderingContext2D;

  constructor(width: number, height: number) {
    super();
    this.canvas = createSkiaCanvas(width, height);
    this.ctx = this.canvas.getContext("2d");
  }

  get width(): number {
    return this.canvas.width;
  }

  set width(value: number) {
    this.canvas.width = value;
  }

  get height(): number {
    return this.canvas.height;
  }

  set height(value: number) {
    this.canvas.height = value;
  }

  beginPath(): void {
    this.ctx.beginPath();
  }

  closePath(): void {
    this.ctx.closePath();
  }

  moveTo(x: number, y: number): void {
    this.ctx.moveTo(x, y);
  }

  lineTo(x: number, y: number): void {
    this.ctx.lineTo(x, y);
  }

  fill(): void {
    this.ctx.fill();
  }

  stroke(): void {
    this.ctx.stroke();
  }

  clear(color?: string): void {
    this.ctx.clearRect(0, 0, this.width, this.height);
    if (color !== undefined) {
      this.ctx.fillStyle = color;
      this.ctx.fillRect(0, 0, this.width, this.height);
    }
  }

  setRenderProps(props: Partial<RenderProps>): void {
    applyRenderProps(this.ctx, props);
  }

  renderToBlob({ format = "png", quality }: RenderImageOptions = {}): Promise<Blob> {
    const bytes = this.canvas.toBufferSync(format, { quality });
    return Promise.resolve(new Blob([new Uint8Array(bytes)], { type: `image/${format}` }));
  }

  renderToDataURL({ format = "png", quality }: RenderImageOptions = {}): Promise<string> {
    return Promise.resolve(this.canvas.toDataURL(format, quality));
  }

  rawRgba(): Uint8Array {
    return this.canvas.toBufferSync("raw", { colorType: "rgba" });
  }
}

/** GML documents used by the comparison tests and the GML scripts. */
export const GML_DATA = fileURLToPath(new URL("../data/", import.meta.url));

export function createGmlView(xml: string, context: RenderContextBase): GMLView {
  return new GMLView(xml, new GMLRenderer(context));
}

export function renderGml(xml: string, context: RenderContextBase): void {
  const view = createGmlView(xml, context);
  view.setPosition(1);
  view.draw();
}
