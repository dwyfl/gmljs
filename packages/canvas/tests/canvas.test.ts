import { describe, expect, test } from "vite-plus/test";
import { PNG } from "pngjs";
import { Canvas as BrowserCanvas } from "../src/browser.ts";
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

describe("PNG encoding", () => {
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

  test("rejects zero-sized images and deferred JPEG", async () => {
    await expect(new Canvas(0, 1).encode()).rejects.toThrow(RangeError);
    await expect(new Canvas(1, 1).encode({ type: "jpeg" })).rejects.toThrow("milestone 5");
  });
});
