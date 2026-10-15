import { PassThrough } from "node:stream";
import { buffer } from "node:stream/consumers";
import type { Bitmap, Context } from "pureimage";
import { requireOptional } from "../require-optional.ts";
import {
  RenderContextBase,
  type RenderImageFormat,
  type RenderImageOptions,
} from "../../render/context.ts";
import { applyRenderProps, type RenderProps } from "../../render/props/index.ts";

type PureImage = typeof import("pureimage");

export class RenderContextPureImage extends RenderContextBase {
  private pureimage: PureImage;
  private bitmap: Bitmap;
  private ctx: Context;
  // The current path, kept here because stroke() does not hand it to pureimage.
  private subpaths: [number, number][][] = [];

  constructor(width: number, height: number) {
    super();
    this.pureimage = requireOptional<PureImage>("pureimage", 'The "pureimage" render context');
    this.bitmap = this.pureimage.make(width, height);
    this.ctx = this.bitmap.getContext("2d");
  }

  get width() {
    return this.bitmap.width;
  }

  get height() {
    return this.bitmap.height;
  }

  // A pureimage bitmap cannot be resized, so resizing replaces it. Like resizing a
  // canvas, this clears the image and resets the context state.
  set width(value) {
    this.resize(value, this.bitmap.height);
  }

  set height(value) {
    this.resize(this.bitmap.width, value);
  }

  private resize(width: number, height: number) {
    this.bitmap = this.pureimage.make(width, height);
    this.ctx = this.bitmap.getContext("2d");
  }

  beginPath() {
    this.subpaths = [];
  }

  closePath() {
    const subpath = this.subpaths.at(-1);
    const first = subpath?.[0];
    if (subpath && first) {
      subpath.push([...first]);
      // Like canvas: the next segment starts at the closed subpath's first point.
      this.subpaths.push([[...first]]);
    }
  }

  moveTo(x: number, y: number) {
    this.subpaths.push([[x, y]]);
  }

  lineTo(x: number, y: number) {
    const subpath = this.subpaths.at(-1);
    if (subpath) {
      subpath.push([x, y]);
    } else {
      this.moveTo(x, y);
    }
  }

  fill() {
    const { ctx } = this;
    ctx.beginPath();
    for (const subpath of this.subpaths) {
      for (const [i, [x, y]] of subpath.entries()) {
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
    }
    ctx.fill();
  }

  /**
   * pureimage strokes a path by filling its outline with the even-odd rule, which leaves
   * holes wherever a stroke overlaps itself (common in GML), and it has no line caps or
   * joins. Instead, fill each segment and a circle at each point separately: convex shapes
   * are unaffected by the fill rule, and the circles give round caps and joins (other
   * lineCap and lineJoin values are not supported).
   *
   * Overlapping shapes are blended more than once, so translucent strokes come out
   * darker where segments meet.
   */
  stroke() {
    const { ctx } = this;
    const radius = ctx.lineWidth / 2;
    if (!(radius > 0)) {
      return;
    }
    const { fillStyle } = ctx;
    ctx.fillStyle = ctx.strokeStyle;
    for (const subpath of this.subpaths) {
      if (subpath.length < 2) {
        continue;
      }
      for (const [i, [x1, y1]] of subpath.entries()) {
        ctx.beginPath();
        ctx.arc(x1, y1, radius, 0, Math.PI * 2);
        ctx.fill();
        const next = subpath[i + 1];
        if (!next) {
          continue;
        }
        const [x2, y2] = next;
        const length = Math.hypot(x2 - x1, y2 - y1);
        if (length === 0) {
          continue;
        }
        const nx = (-(y2 - y1) / length) * radius;
        const ny = ((x2 - x1) / length) * radius;
        ctx.beginPath();
        ctx.moveTo(x1 + nx, y1 + ny);
        ctx.lineTo(x2 + nx, y2 + ny);
        ctx.lineTo(x2 - nx, y2 - ny);
        ctx.lineTo(x1 - nx, y1 - ny);
        ctx.closePath();
        ctx.fill();
      }
    }
    ctx.fillStyle = fillStyle;
  }

  clear(color?: string) {
    // pureimage's clearRect sets one pixel at a time; zeroing the buffer is much faster.
    this.bitmap.data.fill(0);
    if (color !== undefined) {
      this.ctx.fillStyle = color;
      this.ctx.fillRect(0, 0, this.bitmap.width, this.bitmap.height);
    }
  }

  setRenderProps(props: Partial<RenderProps>) {
    // pureimage ignores lineCap and lineJoin; setting them is harmless.
    applyRenderProps(this.ctx as unknown as Record<keyof RenderProps, unknown>, props);
  }

  async renderToDataURL({ type = "jpeg", quality }: RenderImageOptions = {}): Promise<string> {
    const buffer = await this.encode(type, quality);
    return `data:image/${type};base64,${buffer.toString("base64")}`;
  }

  async renderToBlob({ type = "jpeg", quality }: RenderImageOptions = {}): Promise<Blob> {
    const buffer = await this.encode(type, quality);
    return new Blob([new Uint8Array(buffer)], {
      type: `image/${type}`,
    });
  }

  private async encode(type: RenderImageFormat, quality?: number): Promise<Buffer> {
    const stream = new PassThrough();
    // Collect until the readable side ends: the encoders resolve on the writable side.
    const output = buffer(stream);
    if (type === "png") {
      await this.pureimage.encodePNGToStream(this.bitmap, stream);
    } else {
      // Canvas APIs take quality as 0–1; pureimage takes 0–100.
      await this.pureimage.encodeJPEGToStream(
        this.bitmap,
        stream,
        quality === undefined ? undefined : Math.round(quality * 100),
      );
    }
    return output;
  }
}
