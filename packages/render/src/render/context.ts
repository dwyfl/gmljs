import { type RenderProps } from "./props/index.ts";

export type RenderImageFormat = "jpeg" | "png";

export interface RenderContextDimensions {
  width: number;
  height: number;
}

export interface RenderContextOptions extends RenderContextDimensions {
  /** The render context to create; omitted, the entry point's default is used. */
  type?: string;
}

export interface RenderImageOptions {
  /** Defaults to `"png"`. */
  format?: RenderImageFormat;
  /** Encoder quality for lossy formats, 0–1. */
  quality?: number;
}

/** Applies the defaults, and rejects formats that would otherwise be mislabeled. */
export function resolveImageOptions(options: RenderImageOptions = {}): {
  format: RenderImageFormat;
  quality: number | undefined;
} {
  const { format = "png", quality } = options;
  if (format !== "png" && format !== "jpeg") {
    throw new TypeError(`Unsupported image format "${String(format)}"; expected "png" or "jpeg"`);
  }
  if (quality !== undefined && !(Number.isFinite(quality) && quality >= 0 && quality <= 1)) {
    throw new RangeError(`Image quality must be a number from 0 to 1, got ${String(quality)}`);
  }
  return { format, quality };
}

export abstract class RenderContextBase {
  abstract get width(): number;
  abstract get height(): number;
  abstract set width(value: number);
  abstract set height(value: number);
  abstract beginPath(): void;
  abstract closePath(): void;
  abstract moveTo(x: number, y: number): void;
  abstract lineTo(x: number, y: number): void;
  abstract fill(): void;
  abstract stroke(): void;
  /** Erases the whole canvas, then fills it with `color` if one is given. */
  abstract clear(color?: string): void;
  abstract setRenderProps(props: Partial<RenderProps>): void;
  abstract renderToBlob(options?: RenderImageOptions): Promise<Blob>;
  abstract renderToDataURL(options?: RenderImageOptions): Promise<string>;

  async renderToArrayBuffer(options?: RenderImageOptions): Promise<ArrayBuffer> {
    return await (await this.renderToBlob(options)).arrayBuffer();
  }
}
