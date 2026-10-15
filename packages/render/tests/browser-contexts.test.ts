import { afterEach, beforeEach, describe, expect, test } from "vite-plus/test";
import { BrowserRenderContext } from "../src/browser/index.ts";

// Just enough of HTMLCanvasElement for RenderContextHtmlCanvas, which Node lacks.
class FakeCanvas {
  width = 300;
  height = 150;
  getContext() {
    return {};
  }
}

describe("BrowserRenderContext html-canvas", () => {
  beforeEach(() => {
    Object.assign(globalThis, {
      HTMLCanvasElement: FakeCanvas,
      document: { createElement: () => new FakeCanvas() },
    });
  });
  afterEach(() => {
    const scope = globalThis as Record<string, unknown>;
    delete scope.HTMLCanvasElement;
    delete scope.document;
  });

  test("resizes a supplied canvas to the requested dimensions", () => {
    const canvas = new FakeCanvas() as unknown as HTMLCanvasElement;
    const context = BrowserRenderContext.createRenderContext({
      type: "html-canvas",
      canvas,
      width: 800,
      height: 600,
    });
    expect([canvas.width, canvas.height]).toEqual([800, 600]);
    expect([context.width, context.height]).toEqual([800, 600]);
  });

  test("creates a canvas with the requested dimensions", () => {
    const context = BrowserRenderContext.createRenderContext({
      type: "html-canvas",
      width: 640,
      height: 480,
    });
    expect([context.width, context.height]).toEqual([640, 480]);
  });
});
