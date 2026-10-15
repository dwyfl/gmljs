import { describe, test, expect } from "vite-plus/test";
import { BaseRenderProps, applyRenderProps } from "../src/render/props/index.ts";
import { RenderContextSkiaCanvas } from "../src/server/render-context/skia-canvas.ts";
import { RenderContextNodeCanvas } from "../src/server/render-context/node-canvas.ts";
import { RenderContextPureImage } from "../src/server/render-context/pureimage.ts";
import { RenderContextGmljsCanvas } from "../src/server/render-context/gmljs-canvas.ts";
import { ServerRenderContext } from "../src/server/render-context/index.ts";
import { requireOptional } from "../src/server/require-optional.ts";
import { createGMLImage } from "../src/server/index.ts";
import { pixelReaderfromDataURL } from "./helpers/pixels.ts";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { loadImage } from "skia-canvas";

describe("applyRenderProps", () => {
  test("ignores unknown keys, invalid values and __proto__", () => {
    const props = new BaseRenderProps();
    // JSON.parse creates an own "__proto__" key, like untrusted input would.
    applyRenderProps(
      props,
      JSON.parse(
        '{"__proto__": {"polluted": true}, "lineWidth": 7, "lineCap": "invalid", "font": "x"}',
      ),
    );
    expect(Object.getPrototypeOf(props)).toBe(BaseRenderProps.prototype);
    expect(props.lineWidth).toBe(7);
    expect(props.lineCap).toBe("round");
    expect(Object.hasOwn(props, "font")).toBe(false);
  });

  test("is applied by render contexts", () => {
    const context = new RenderContextNodeCanvas(10, 10);
    context.setRenderProps(JSON.parse('{"lineWidth": 5, "lineJoin": "nope"}'));
    // The canvas keeps its default lineJoin ("miter"); the valid lineWidth is applied.
    const ctx = (context as unknown as { ctx: CanvasRenderingContext2D }).ctx;
    expect(ctx.lineWidth).toBe(5);
    expect(ctx.lineJoin).toBe("miter");
  });
});

describe("RenderContextSkiaCanvas", () => {
  test.each([
    ["png", "89504e47"],
    ["jpeg", "ffd8ff"],
  ] as const)("renderToBlob encodes %s", async (type, magic) => {
    const blob = await new RenderContextSkiaCanvas(10, 10).renderToBlob({
      type,
    });
    const bytes = Buffer.from(await blob.arrayBuffer());
    expect(bytes.toString("hex").startsWith(magic)).toBe(true);
    expect(blob.type).toBe(`image/${type}`);
  });
});

describe("RenderContextGmljsCanvas", () => {
  test("is the default server render context", () => {
    expect(ServerRenderContext.createRenderContext({ width: 10, height: 10 })).toBeInstanceOf(
      RenderContextGmljsCanvas,
    );
  });

  test("renderToBlob encodes jpeg by default", async () => {
    const blob = await new RenderContextGmljsCanvas(10, 10).renderToBlob();
    const bytes = Buffer.from(await blob.arrayBuffer());
    expect(bytes.toString("hex").startsWith("ffd8ff")).toBe(true);
    expect(blob.type).toBe("image/jpeg");
  });

  test("renderToDataURL encodes jpeg", async () => {
    const dataURL = await new RenderContextGmljsCanvas(10, 10).renderToDataURL();
    expect(dataURL).toMatch(/^data:image\/jpeg;base64,\/9j\//);
  });

  test("round-trips jpeg", async () => {
    const context = new RenderContextGmljsCanvas(13, 17);
    context.clear("#315ca8");
    const blob = await context.renderToBlob({ type: "jpeg", quality: 0.92 });
    const image = await loadImage(Buffer.from(await blob.arrayBuffer()));
    expect([image.width, image.height]).toEqual([13, 17]);
  });

  test("resizing replaces the bitmap", async () => {
    const context = new RenderContextGmljsCanvas(10, 10);
    context.width = 20;
    context.height = 5;
    const pixels = await pixelReaderfromDataURL(await context.renderToBlob({ type: "png" }));
    expect([pixels.width, pixels.height]).toEqual([20, 5]);
  });

  test("applies render props", async () => {
    const context = new RenderContextGmljsCanvas(40, 20);
    context.clear("#fff");
    context.setRenderProps({ strokeStyle: "#000", lineWidth: 10, lineCap: "round" });
    context.beginPath();
    context.moveTo(10, 10);
    context.lineTo(30, 10);
    context.stroke();
    const pixels = await pixelReaderfromDataURL(await context.renderToBlob({ type: "png" }));
    // Past the ends on the center line: inside the round cap.
    expect(pixels.at(7, 10).r).toBeLessThan(64);
    expect(pixels.at(32, 10).r).toBeLessThan(64);
    // The cap's corner is outside the circle.
    expect(pixels.at(5, 5).r).toBeGreaterThan(192);
  });

  test("renders a document close to skia-canvas", async () => {
    const gml = readFileSync(
      fileURLToPath(new URL("data/example002.xml", import.meta.url)),
      "utf8",
    );
    const [reference, rendered] = await Promise.all(
      (["skia-canvas", undefined] as const).map(async (type) =>
        PNG.sync.read(
          Buffer.from(
            await createGMLImage(gml, {
              type,
              width: 320,
              height: 240,
              format: "png",
            }),
          ),
        ),
      ),
    );
    const mismatched = pixelmatch(reference!.data, rendered!.data, undefined, 320, 240, {
      threshold: 0.1,
    });
    let ink = 0;
    for (let i = 0; i < reference!.data.length; i += 4) {
      if (reference!.data[i]! < 128) {
        ink += 1;
      }
    }
    expect(mismatched / ink).toBeLessThan(0.01);
  });

  test("createGMLImage defaults to jpeg", async () => {
    const image = await createGMLImage("<gml></gml>", { width: 10, height: 10 });
    expect(Buffer.from(image).toString("hex").startsWith("ffd8ff")).toBe(true);
  });
});

describe("RenderContextPureImage", () => {
  test.each([
    ["png", "89504e47"],
    ["jpeg", "ffd8ff"],
  ] as const)("renderToBlob encodes %s", async (type, magic) => {
    const blob = await new RenderContextPureImage(10, 10).renderToBlob({
      type,
    });
    const bytes = Buffer.from(await blob.arrayBuffer());
    expect(bytes.toString("hex").startsWith(magic)).toBe(true);
    expect(blob.type).toBe(`image/${type}`);
  });

  test("renderToDataURL encodes png", async () => {
    const dataURL = await new RenderContextPureImage(10, 10).renderToDataURL({
      type: "png",
    });
    expect(dataURL).toMatch(/^data:image\/png;base64,iVBORw0KGgo/);
  });

  test("resizing replaces the bitmap", async () => {
    const context = new RenderContextPureImage(10, 10);
    context.width = 20;
    context.height = 5;
    const pixels = await pixelReaderfromDataURL(await context.renderToBlob({ type: "png" }));
    expect([pixels.width, pixels.height]).toEqual([20, 5]);
  });

  test("a stroke that crosses itself has no hole", async () => {
    const context = new RenderContextPureImage(40, 40);
    context.clear("#fff");
    context.setRenderProps({ strokeStyle: "#000", lineWidth: 10 });
    context.beginPath();
    context.moveTo(5, 5);
    context.lineTo(35, 35);
    context.lineTo(35, 5);
    context.lineTo(5, 35);
    context.stroke();
    const pixels = await pixelReaderfromDataURL(await context.renderToBlob({ type: "png" }));
    // pureimage's own stroke() fills with the even-odd rule, leaving the crossing white.
    expect(pixels.at(20, 20).r).toBeLessThan(64);
  });

  test("draws round caps", async () => {
    const context = new RenderContextPureImage(40, 20);
    context.clear("#fff");
    context.setRenderProps({ strokeStyle: "#000", lineWidth: 10 });
    context.beginPath();
    context.moveTo(10, 10);
    context.lineTo(30, 10);
    context.stroke();
    const pixels = await pixelReaderfromDataURL(await context.renderToBlob({ type: "png" }));
    // Past the ends on the center line: inside the cap.
    expect(pixels.at(7, 10).r).toBeLessThan(64);
    expect(pixels.at(32, 10).r).toBeLessThan(64);
    // The cap's corner is outside the circle.
    expect(pixels.at(6, 6).r).toBeGreaterThan(192);
  });

  test("renders a document close to skia-canvas", async () => {
    const gml = readFileSync(
      fileURLToPath(new URL("data/example002.xml", import.meta.url)),
      "utf8",
    );
    const [reference, rendered] = await Promise.all(
      (["skia-canvas", "pureimage"] as const).map(async (type) =>
        PNG.sync.read(
          Buffer.from(
            await createGMLImage(gml, {
              type,
              width: 320,
              height: 240,
              format: "png",
            }),
          ),
        ),
      ),
    );
    const mismatched = pixelmatch(reference!.data, rendered!.data, undefined, 320, 240, {
      threshold: 0.1,
    });
    let ink = 0;
    for (let i = 0; i < reference!.data.length; i += 4) {
      if (reference!.data[i]! < 128) {
        ink += 1;
      }
    }
    // About 0.6% of the ink pixels differ (6% with pureimage's own stroke()).
    expect(mismatched / ink).toBeLessThan(0.02);
  });
});

describe("requireOptional", () => {
  test("loads an installed package", () => {
    const canvas = requireOptional<typeof import("canvas")>("canvas", "Test");
    expect(typeof canvas.createCanvas).toBe("function");
  });

  test("explains how to install a missing package", () => {
    let error: unknown;
    try {
      requireOptional("gmlrender-missing-package", 'The "test" render context');
    } catch (e) {
      error = e;
    }
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toContain(
      'The "test" render context requires the optional "gmlrender-missing-package" package',
    );
    expect((error as Error).message).toContain("npm install gmlrender-missing-package");
    expect((error as Error).cause).toBeInstanceOf(Error);
  });
});
