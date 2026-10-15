import { CanvasContext2D } from "./context-2d.ts";
import { encodeJpeg, type ChromaSubsampling } from "../encode/jpeg.ts";
import { encodePng, type Deflate } from "../encode/png.ts";
import { PixelBuffer } from "../pixels/pixel-buffer.ts";

export interface CanvasOptions {
  readonly deflate?: Deflate;
}

export type ImageFormat = "png" | "jpeg";

export interface EncodeOptions {
  /** Defaults to `"png"`. */
  readonly format?: ImageFormat;
  /** JPEG quality from 0 to 1. Defaults to 0.92. */
  readonly quality?: number;
  readonly chromaSubsampling?: ChromaSubsampling;
}

export class Canvas {
  private bitmap: PixelBuffer;
  private readonly context: CanvasContext2D;
  private readonly deflate: Deflate | undefined;

  constructor(width: number, height: number, options: CanvasOptions = {}) {
    validateDimension(width, "width");
    validateDimension(height, "height");
    validateByteLength(width, height);
    this.bitmap = new PixelBuffer(width, height);
    this.context = new CanvasContext2D(this.bitmap);
    this.deflate = options.deflate;
  }

  get width(): number {
    return this.bitmap.width;
  }

  set width(value: number) {
    this.resize(value, this.height);
  }

  get height(): number {
    return this.bitmap.height;
  }

  set height(value: number) {
    this.resize(this.width, value);
  }

  /** A zero-copy premultiplied RGBA8 view. Assigning width or height invalidates it. */
  get pixels(): Uint8Array {
    return this.bitmap.data;
  }

  getContext(contextId: "2d"): CanvasContext2D;
  getContext(contextId: string): CanvasContext2D | null;
  getContext(contextId: string): CanvasContext2D | null {
    return contextId === "2d" ? this.context : null;
  }

  async encode(options: EncodeOptions = {}): Promise<Uint8Array> {
    if (imageFormat(options.format) === "jpeg") {
      return encodeJpeg(this.bitmap, {
        quality: jpegQuality(options.quality),
        subsampling: options.chromaSubsampling ?? "4:2:0",
      });
    }
    if (!this.deflate) {
      throw new Error(
        'PNG encoding needs a Deflate adapter; import from "@gmljs/canvas/node" or "@gmljs/canvas/browser"',
      );
    }
    return encodePng(this.bitmap, this.deflate);
  }

  async toBlob(options: EncodeOptions = {}): Promise<Blob> {
    const format = imageFormat(options.format);
    const bytes = await this.encode(options);
    return new Blob([ownedBuffer(bytes)], { type: `image/${format}` });
  }

  async toDataURL(options: EncodeOptions = {}): Promise<string> {
    const format = imageFormat(options.format);
    const bytes = await this.encode(options);
    return `data:image/${format};base64,${base64(bytes)}`;
  }

  private resize(width: number, height: number): void {
    validateDimension(width, "width");
    validateDimension(height, "height");
    validateByteLength(width, height);
    this.bitmap = new PixelBuffer(width, height);
    this.context.reset(this.bitmap);
  }
}

function imageFormat(value: unknown): ImageFormat {
  if (value === undefined) {
    return "png";
  }
  if (value === "png" || value === "jpeg") {
    return value;
  }
  throw new TypeError(
    `Unsupported image format ${JSON.stringify(value)}; expected "png" or "jpeg"`,
  );
}

function jpegQuality(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1
    ? Math.max(1, Math.round(value * 100))
    : 92;
}

function validateDimension(value: number, name: string): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative safe integer`);
  }
}

function validateByteLength(width: number, height: number): void {
  if (width !== 0 && height > Math.floor(Number.MAX_SAFE_INTEGER / 4 / width)) {
    throw new RangeError("canvas dimensions exceed the maximum safe byte length");
  }
}

function base64(data: Uint8Array): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const chunks: string[] = [];
  for (let offset = 0; offset < data.length; offset += 12_288) {
    const end = Math.min(data.length, offset + 12_288);
    let chunk = "";
    for (let i = offset; i < end; i += 3) {
      const a = data[i]!;
      const hasB = i + 1 < data.length;
      const hasC = i + 2 < data.length;
      const b = hasB ? data[i + 1]! : 0;
      const c = hasC ? data[i + 2]! : 0;
      chunk += alphabet[a >>> 2];
      chunk += alphabet[((a & 3) << 4) | (b >>> 4)];
      chunk += hasB ? alphabet[((b & 15) << 2) | (c >>> 6)] : "=";
      chunk += hasC ? alphabet[c & 63] : "=";
    }
    chunks.push(chunk);
  }
  return chunks.join("");
}

function ownedBuffer(data: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(data.length);
  copy.set(data);
  return copy.buffer;
}
