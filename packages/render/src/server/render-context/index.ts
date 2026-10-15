import type { RenderContextBase, RenderContextDimensions } from "../../render/context.ts";
import { RenderContextNodeCanvas } from "./node-canvas.ts";
import { RenderContextSkiaCanvas } from "./skia-canvas.ts";
import { RenderContextPureImage } from "./pureimage.ts";

export { RenderContextNodeCanvas } from "./node-canvas.ts";
export { RenderContextSkiaCanvas } from "./skia-canvas.ts";
export { RenderContextPureImage } from "./pureimage.ts";

export interface RenderContextNodeCanvasOptions extends RenderContextDimensions {
  type: "node-canvas";
}

export interface RenderContextSkiaCanvasOptions extends RenderContextDimensions {
  type: "skia-canvas";
}

export interface RenderContextPureImageOptions extends RenderContextDimensions {
  type: "pureimage";
}

export type ServerRenderContextOptions =
  | RenderContextNodeCanvasOptions
  | RenderContextSkiaCanvasOptions
  | RenderContextPureImageOptions;
export type ServerRenderContextType = ServerRenderContextOptions["type"];

export class ServerRenderContext {
  static createRenderContext(this: void, options: ServerRenderContextOptions): RenderContextBase {
    switch (options.type) {
      case "node-canvas":
        return new RenderContextNodeCanvas(options.width, options.height);
      case "skia-canvas":
        return new RenderContextSkiaCanvas(options.width, options.height);
      case "pureimage":
        return new RenderContextPureImage(options.width, options.height);
      default:
        throw new Error(
          `Invalid render context type "${String((options as { type: unknown }).type)}"`,
        );
    }
  }
}
