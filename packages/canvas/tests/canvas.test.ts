import { describe, expect, test } from "vite-plus/test";
import { PNG } from "pngjs";
import { Canvas as BrowserCanvas } from "../src/browser.ts";
import { Canvas as CoreCanvas } from "../src/core.ts";
import { Canvas } from "../src/node.ts";
import { PixelBuffer } from "../src/pixels/pixel-buffer.ts";

describe("Canvas", () => {
  test("returns one 2D context and rejects unknown context IDs", () => {
    const canvas = new Canvas(2, 2);
    expect(canvas.getContext("2d")).toBe(canvas.getContext("2d"));
    expect(canvas.getContext("webgl")).toBeNull();
  });

  test("resizing clears pixels, resets state, and invalidates the pixel view", () => {
    const canvas = new Canvas(2, 2);
    const context = canvas.getContext("2d");
    context.fillStyle = "red";
    context.fillRect(0, 0, 2, 2);
    const oldPixels = canvas.pixels;

    canvas.width = 3;

    expect(canvas.width).toBe(3);
    expect(canvas.height).toBe(2);
    expect(canvas.pixels).not.toBe(oldPixels);
    expect([...canvas.pixels]).toEqual(Array.from({ length: 24 }, () => 0));
    expect(context.fillStyle).toBe("#000000");
  });

  test("validates dimensions", () => {
    expect(() => new Canvas(-1, 2)).toThrow(RangeError);
    expect(() => new Canvas(1.5, 2)).toThrow(RangeError);
    expect(() => new Canvas(Number.POSITIVE_INFINITY, 2)).toThrow(RangeError);
  });
});

describe("rectangle painting", () => {
  test("fills opaque spans in RGBA byte order", () => {
    const canvas = new Canvas(3, 1);
    const context = canvas.getContext("2d");
    context.fillStyle = "#123456";
    context.fillRect(1, 0, 2, 1);
    expect([...canvas.pixels]).toEqual([0, 0, 0, 0, 0x12, 0x34, 0x56, 255, 0x12, 0x34, 0x56, 255]);
  });

  test("composites translucent colors in premultiplied sRGB", () => {
    const canvas = new Canvas(1, 1);
    const context = canvas.getContext("2d");
    context.fillStyle = "#ff000080";
    context.fillRect(0, 0, 1, 1);
    context.fillStyle = "#0000ff80";
    context.fillRect(0, 0, 1, 1);
    expect([...canvas.pixels]).toEqual([64, 0, 128, 192]);
  });

  test("packed translucent blending matches scalar byte rounding", () => {
    const buffer = new PixelBuffer(256, 1);
    const original = new Uint8Array(buffer.data.length);
    for (let value = 0; value < 256; value += 1) {
      const offset = value * 4;
      original[offset] = value;
      original[offset + 1] = 255 - value;
      original[offset + 2] = (value * 73) & 0xff;
      original[offset + 3] = (value * 151) & 0xff;
    }

    for (let alpha = 1; alpha < 255; alpha += 1) {
      buffer.data.set(original);
      const color = { r: (alpha * 37) & 0xff, g: (alpha * 67) & 0xff, b: 255 - alpha, a: alpha };
      buffer.fillRect(0, 0, 256, 1, color);

      const source = [
        divide255ForTest(color.r * alpha),
        divide255ForTest(color.g * alpha),
        divide255ForTest(color.b * alpha),
        alpha,
      ];
      for (let offset = 0; offset < buffer.data.length; offset += 1) {
        expect(buffer.data[offset]).toBe(
          source[offset & 3]! + divide255ForTest(original[offset]! * (255 - alpha)),
        );
      }
    }
  });

  test("long translucent spans preserve scalar byte rounding", () => {
    const buffer = new PixelBuffer(4096, 1);
    for (let offset = 0; offset < buffer.data.length; offset += 4) {
      const pixel = offset >> 2;
      buffer.data[offset] = pixel & 0xff;
      buffer.data[offset + 1] = (pixel * 17) & 0xff;
      buffer.data[offset + 2] = (pixel * 73) & 0xff;
      buffer.data[offset + 3] = (pixel * 151) & 0xff;
    }
    const original = buffer.data.slice();
    const color = { r: 47, g: 113, b: 229, a: 137 };
    buffer.fillRect(0, 0, 4096, 1, color);

    const source = [
      divide255ForTest(color.r * color.a),
      divide255ForTest(color.g * color.a),
      divide255ForTest(color.b * color.a),
      color.a,
    ];
    const expected = original.map(
      (value, offset) => source[offset & 3]! + divide255ForTest(value * (255 - color.a)),
    );
    expect(buffer.data).toEqual(expected);

    buffer.data.fill(61);
    buffer.fillRect(0, 0, 4096, 1, color);
    expect(buffer.data).toEqual(
      new Uint8Array(4096 * 4)
        .fill(0)
        .map((_, offset) => source[offset & 3]! + divide255ForTest(61 * (255 - color.a))),
    );
  });

  test("uses exact box coverage for fractional rectangles", () => {
    const canvas = new Canvas(2, 2);
    const context = canvas.getContext("2d");
    context.fillStyle = "red";
    context.fillRect(0.5, 0.5, 1, 1);
    expect([...canvas.pixels]).toEqual([64, 0, 0, 64, 64, 0, 0, 64, 64, 0, 0, 64, 64, 0, 0, 64]);
  });

  test("normalizes negative dimensions and clips", () => {
    const canvas = new Canvas(3, 1);
    const context = canvas.getContext("2d");
    context.fillStyle = "lime";
    context.fillRect(3, 0, -2, 1);
    expect([...canvas.pixels]).toEqual([0, 0, 0, 0, 0, 255, 0, 255, 0, 255, 0, 255]);
  });

  test("clearRect erases instead of painting transparent black", () => {
    const canvas = new Canvas(2, 1);
    const context = canvas.getContext("2d");
    context.fillStyle = "red";
    context.fillRect(0, 0, 2, 1);
    context.clearRect(0.5, 0, 1, 1);
    expect([...canvas.pixels]).toEqual([127, 0, 0, 127, 127, 0, 0, 127]);
  });

  test("invalid style assignments preserve the previous style", () => {
    const canvas = new Canvas(1, 1);
    const context = canvas.getContext("2d");
    context.fillStyle = "blue";
    context.fillStyle = "definitely invalid";
    context.fillRect(0, 0, 1, 1);
    expect([...canvas.pixels]).toEqual([0, 0, 255, 255]);
  });
});

function divide255ForTest(value: number): number {
  const biased = value + 128;
  return (biased + (biased >> 8)) >> 8;
}

describe("Encoding", () => {
  test("writes a standards-compatible straight-alpha RGBA PNG", async () => {
    const canvas = new Canvas(2, 1);
    const context = canvas.getContext("2d");
    context.fillStyle = "#ff000080";
    context.fillRect(0, 0, 1, 1);
    context.fillStyle = "#00ff00";
    context.fillRect(1, 0, 1, 1);

    const encoded = await canvas.encode();
    const png = PNG.sync.read(Buffer.from(encoded));
    expect(png.width).toBe(2);
    expect(png.height).toBe(1);
    expect([...png.data]).toEqual([255, 0, 0, 128, 0, 255, 0, 255]);
  });

  test("provides Blob and data URL conveniences", async () => {
    const canvas = new Canvas(1, 1);
    const blob = await canvas.toBlob();
    const url = await canvas.toDataURL();
    expect(blob.type).toBe("image/png");
    expect(blob.size).toBeGreaterThan(60);
    expect(url).toMatch(/^data:image\/png;base64,iVBOR/);
  });

  test("uses CompressionStream through the browser entry", async () => {
    const canvas = new BrowserCanvas(1, 1);
    canvas.getContext("2d").fillRect(0, 0, 1, 1);
    const png = PNG.sync.read(Buffer.from(await canvas.encode()));
    expect([...png.data]).toEqual([0, 0, 0, 255]);
  });

  test("rejects unsupported formats instead of mislabeling PNG bytes", async () => {
    const canvas = new Canvas(1, 1);
    for (const format of ["gif", "jpg", "image/png", ""] as unknown[]) {
      const options = { format: format as "png" };
      await expect(canvas.encode(options)).rejects.toThrow(TypeError);
      await expect(canvas.toBlob(options)).rejects.toThrow(TypeError);
      await expect(canvas.toDataURL(options)).rejects.toThrow(TypeError);
    }
  });

  test("rejects zero-sized images", async () => {
    await expect(new Canvas(0, 1).encode()).rejects.toThrow(RangeError);
    await expect(new Canvas(1, 0).encode({ format: "jpeg" })).rejects.toThrow(RangeError);
  });

  test("encodes JPEG without a Deflate adapter and labels conveniences", async () => {
    const canvas = new CoreCanvas(2, 2);
    canvas.getContext("2d").fillRect(0, 0, 2, 2);
    const bytes = await canvas.encode({ format: "jpeg" });
    const blob = await canvas.toBlob({ format: "jpeg" });
    const url = await canvas.toDataURL({ format: "jpeg" });
    expect([...bytes.subarray(0, 3)]).toEqual([0xff, 0xd8, 0xff]);
    expect(blob.type).toBe("image/jpeg");
    expect(url).toMatch(/^data:image\/jpeg;base64,\/9j\//);
  });

  test("maps JPEG quality like the HTML Canvas API", async () => {
    const canvas = new Canvas(32, 24);
    const context = canvas.getContext("2d");
    context.fillStyle = "#c23a72";
    context.fillRect(0, 0, 17, 13);
    const defaults = await canvas.encode({ format: "jpeg" });
    expect(await canvas.encode({ format: "jpeg", quality: 0.92 })).toEqual(defaults);
    for (const quality of [Number.NaN, -1, 2, "0.5"] as unknown[]) {
      expect(await canvas.encode({ format: "jpeg", quality: quality as number })).toEqual(defaults);
    }
    await expect(canvas.encode({ format: "jpeg", quality: 0 })).resolves.toBeInstanceOf(Uint8Array);
  });

  test("increases JPEG size monotonically with quality", async () => {
    const canvas = new Canvas(96, 64);
    for (let offset = 0; offset < canvas.pixels.length; offset += 4) {
      const pixel = offset >> 2;
      canvas.pixels[offset] = (pixel * 73) & 0xff;
      canvas.pixels[offset + 1] = (pixel * 151) & 0xff;
      canvas.pixels[offset + 2] = (pixel * 199) & 0xff;
      canvas.pixels[offset + 3] = 255;
    }
    const sizes: number[] = [];
    for (const quality of [0.1, 0.3, 0.5, 0.7, 0.9, 1]) {
      sizes.push((await canvas.encode({ format: "jpeg", quality })).length);
    }
    expect(sizes).toEqual([...sizes].sort((a, b) => a - b));
  });

  test("encodes premultiplied alpha as compositing over black", async () => {
    const transparent = new Canvas(8, 8);
    const red = new Canvas(8, 8);
    red.getContext("2d").fillStyle = "rgba(255, 0, 0, 0.5)";
    red.getContext("2d").fillRect(0, 0, 8, 8);
    const { default: jpeg } = await import("jpeg-js");
    const transparentJpeg = jpeg.decode(await transparent.encode({ format: "jpeg" }), {
      useTArray: true,
    });
    const redBytes = await red.encode({ format: "jpeg", chromaSubsampling: "4:4:4" });
    const redDecoded = jpeg.decode(redBytes, { useTArray: true });
    expect([...transparentJpeg.data.subarray(0, 3)]).toEqual([0, 0, 0]);
    expect(redDecoded.data[0]).toBeGreaterThanOrEqual(126);
    expect(redDecoded.data[0]).toBeLessThanOrEqual(129);
    expect(redDecoded.data[1]).toBeLessThanOrEqual(2);
    expect(redDecoded.data[2]).toBeLessThanOrEqual(2);

    const transparentScene = new Canvas(16, 16);
    const blackScene = new Canvas(16, 16);
    blackScene.getContext("2d").fillStyle = "black";
    blackScene.getContext("2d").fillRect(0, 0, 16, 16);
    for (const scene of [transparentScene, blackScene]) {
      scene.getContext("2d").fillStyle = "white";
      scene.getContext("2d").fillRect(4, 4, 8, 8);
    }
    expect(await transparentScene.encode({ format: "jpeg" })).toEqual(
      await blackScene.encode({ format: "jpeg" }),
    );
  });
});
