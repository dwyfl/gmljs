import type { RenderContextBase, RenderContextDimensions } from "../../render/context.ts";
import { RenderContextHtmlCanvas } from "./html-canvas.ts";
import { RenderContextOffscreenCanvas } from "./offscreen-canvas.ts";

export { RenderContextHtmlCanvas } from "./html-canvas.ts";
export { RenderContextOffscreenCanvas } from "./offscreen-canvas.ts";

export interface RenderContextOffscreenCanvasOptions extends RenderContextDimensions {
  type: "offscreen-canvas";
}

export interface RenderContextHtmlCanvasOptions extends RenderContextDimensions {
  type: "html-canvas";
  /** Draw into this canvas, resized to `width` × `height`. Omitted, a new canvas is created. */
  canvas?: HTMLCanvasElement;
}

export type BrowserRenderContextOptions =
  | RenderContextOffscreenCanvasOptions
  | RenderContextHtmlCanvasOptions;
export type BrowserRenderContextType = BrowserRenderContextOptions["type"];

export class BrowserRenderContext {
  static createRenderContext(this: void, options: BrowserRenderContextOptions): RenderContextBase {
    switch (options.type) {
      case "html-canvas":
        if (options.canvas) {
          const context = new RenderContextHtmlCanvas(options.canvas);
          context.width = options.width;
          context.height = options.height;
          return context;
        }
        return new RenderContextHtmlCanvas(options.width, options.height);
      case "offscreen-canvas":
        return new RenderContextOffscreenCanvas(options.width, options.height);
      default:
        throw new Error(
          `Invalid render context type "${String((options as { type: unknown }).type)}"`,
        );
    }
  }
}
