import { fileURLToPath } from "node:url";
import {
  GMLRenderer,
  GMLView,
  RenderContextBase,
  type RenderImageOptions,
  type RenderProps,
} from "@gmljs/render";
import {
  Canvas as SkiaCanvas,
  type CanvasRenderingContext2D as SkiaCanvasRenderingContext2D,
} from "skia-canvas";
import { Canvas, type CanvasRenderingContext2D } from "../src/node.ts";

export class RenderContextTscanvas extends RenderContextBase {
  private readonly canvas: Canvas;
  private readonly context: CanvasRenderingContext2D;

  constructor(width: number, height: number) {
    super();
    this.canvas = new Canvas(width, height);
    this.context = this.canvas.getContext("2d");
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
    this.context.beginPath();
  }

  closePath(): void {
    this.context.closePath();
  }

  moveTo(x: number, y: number): void {
    this.context.moveTo(x, y);
  }

  lineTo(x: number, y: number): void {
    this.context.lineTo(x, y);
  }

  fill(): void {
    this.context.fill();
  }

  stroke(): void {
    this.context.stroke();
  }

  clear(color?: string): void {
    this.context.clearRect(0, 0, this.width, this.height);
    if (color !== undefined) {
      this.context.fillStyle = color;
      this.context.fillRect(0, 0, this.width, this.height);
    }
  }

  setRenderProps(props: Partial<RenderProps>): void {
    if (props.fillStyle !== undefined) this.context.fillStyle = props.fillStyle;
    if (props.strokeStyle !== undefined) this.context.strokeStyle = props.strokeStyle;
    if (props.lineWidth !== undefined) this.context.lineWidth = props.lineWidth;
    if (props.lineCap !== undefined) this.context.lineCap = props.lineCap;
    if (props.lineJoin !== undefined) this.context.lineJoin = props.lineJoin;
  }

  renderToBlob(options: RenderImageOptions = { type: "png" }): Promise<Blob> {
    return this.canvas.toBlob(options);
  }

  renderToDataURL(options: RenderImageOptions = { type: "png" }): Promise<string> {
    return this.canvas.toDataURL(options);
  }
}

export class RenderContextSkiaRaw extends RenderContextBase {
  private readonly canvas: SkiaCanvas;
  private readonly context: SkiaCanvasRenderingContext2D;

  constructor(width: number, height: number) {
    super();
    this.canvas = new SkiaCanvas(width, height);
    this.context = this.canvas.getContext("2d");
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
    this.context.beginPath();
  }

  closePath(): void {
    this.context.closePath();
  }

  moveTo(x: number, y: number): void {
    this.context.moveTo(x, y);
  }

  lineTo(x: number, y: number): void {
    this.context.lineTo(x, y);
  }

  fill(): void {
    this.context.fill();
  }

  stroke(): void {
    this.context.stroke();
  }

  clear(color?: string): void {
    this.context.clearRect(0, 0, this.width, this.height);
    if (color !== undefined) {
      this.context.fillStyle = color;
      this.context.fillRect(0, 0, this.width, this.height);
    }
  }

  setRenderProps(props: Partial<RenderProps>): void {
    if (props.fillStyle !== undefined) this.context.fillStyle = props.fillStyle;
    if (props.strokeStyle !== undefined) this.context.strokeStyle = props.strokeStyle;
    if (props.lineWidth !== undefined) this.context.lineWidth = props.lineWidth;
    if (props.lineCap !== undefined) this.context.lineCap = props.lineCap;
    if (props.lineJoin !== undefined) this.context.lineJoin = props.lineJoin;
  }

  renderToBlob({ type, quality }: RenderImageOptions = { type: "png" }): Promise<Blob> {
    const bytes = this.canvas.toBufferSync(type, { quality });
    return Promise.resolve(new Blob([new Uint8Array(bytes)], { type: `image/${type}` }));
  }

  renderToDataURL({ type, quality }: RenderImageOptions = { type: "png" }): Promise<string> {
    return Promise.resolve(this.canvas.toDataURL(type, quality));
  }

  rawRgba(): Uint8Array {
    return this.canvas.toBufferSync("raw", { colorType: "rgba" });
  }
}

/** GML documents used by the integration tests and the GML scripts. */
export const GML_DATA = fileURLToPath(new URL("./data/", import.meta.url));

export function createGmlView(xml: string, context: RenderContextBase): GMLView {
  return new GMLView(xml, new GMLRenderer(context));
}

export function renderGml(xml: string, context: RenderContextBase): void {
  const view = createGmlView(xml, context);
  view.setPosition(1);
  view.draw();
}
