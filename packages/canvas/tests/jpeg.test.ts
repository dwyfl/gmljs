import jpeg from "jpeg-js";
import { Canvas as SkiaCanvas, loadImage } from "skia-canvas";
import { describe, expect, test } from "vite-plus/test";
import { encodeJpeg, type JpegSource } from "../src/encode/jpeg.ts";

const SUBSAMPLING = ["4:2:0", "4:4:4"] as const;

describe("JPEG encoder", () => {
  test.each(SUBSAMPLING)("writes the required %s baseline JFIF structure", (subsampling) => {
    const source = makeSource(17, 19);
    const quality50 = encodeJpeg(source, { quality: 50, subsampling });
    const parsed = parseJpeg(quality50);
    expect(parsed.markers).toEqual([0xd8, 0xe0, 0xdb, 0xc0, 0xc4, 0xda, 0xd9]);
    expect(parsed.width).toBe(17);
    expect(parsed.height).toBe(19);
    expect(parsed.sampling).toEqual(
      subsampling === "4:2:0" ? [0x22, 0x11, 0x11] : [0x11, 0x11, 0x11],
    );
    expect(parsed.quantization[0]).toEqual(zigzag(LUMINANCE_QUANTIZATION));
    expect(parsed.quantization[1]).toEqual(zigzag(CHROMINANCE_QUANTIZATION));
    expect(
      parsed.entropy.every((value, index) => value !== 0xff || parsed.entropy[index + 1] === 0),
    ).toBe(true);

    const quality100 = parseJpeg(encodeJpeg(source, { quality: 100, subsampling }));
    expect(
      [...quality100.quantization[0]!, ...quality100.quantization[1]!].every(
        (value) => value === 1,
      ),
    ).toBe(true);
  });

  test.each(SUBSAMPLING)(
    "both decoders accept edge-sized images in %s",
    async (subsampling) => {
      for (const [width, height] of [
        [1, 1],
        [2, 2],
        [7, 9],
        [8, 8],
        [9, 8],
        [15, 17],
        [16, 16],
        [17, 1],
        [1, 17],
        [33, 31],
        [1023, 767],
      ] as const) {
        const source = makeSource(width, height);
        const encoded = encodeJpeg(source, { quality: 92, subsampling });
        const js = decodeJpegJs(encoded);
        const skia = await decodeSkia(encoded);
        expect([js.width, js.height]).toEqual([width, height]);
        expect([skia.width, skia.height]).toEqual([width, height]);
        if (subsampling === "4:2:0") {
          expect(meanYDifference(js.data, skia.data)).toBeLessThanOrEqual(1.3);
          expect(maxYDifference(js.data, skia.data)).toBeLessThanOrEqual(8);
        } else {
          expect(maxDifference(js.data, skia.data)).toBeLessThanOrEqual(4);
        }
        if (width > 4 && height > 4) {
          const edge = regionMeanError(js.data, source.data, width, height, true);
          const interior = regionMeanError(js.data, source.data, width, height, false);
          expect(edge).toBeLessThanOrEqual(interior * 1.75 + 8);
        }
      }
    },
    30_000,
  );

  test.each(SUBSAMPLING)("keeps solid colors within two levels in %s", async (subsampling) => {
    const colors = [
      [0, 0, 0],
      [255, 255, 255],
      [128, 128, 128],
      [255, 0, 0],
      [0, 255, 0],
      [0, 0, 255],
      [255, 255, 0],
      [0, 255, 255],
      [255, 0, 255],
      [64, 64, 64],
      [192, 192, 192],
      [128, 0, 0],
      [0, 128, 0],
      [0, 0, 128],
      [255, 128, 0],
      [128, 0, 255],
      [0, 128, 255],
      [40, 120, 200],
      [220, 80, 140],
      [17, 231, 93],
    ] as const;
    for (const color of colors) {
      const source = solidSource(16, 16, color);
      const encoded = encodeJpeg(source, { quality: 92, subsampling });
      const js = decodeJpegJs(encoded);
      const skia = await decodeSkia(encoded);
      expect(maxRgbError(js.data, source.data)).toBeLessThanOrEqual(2);
      expect(maxDifference(js.data, skia.data)).toBeLessThanOrEqual(2);
    }
  });

  test.each(SUBSAMPLING)(
    "uses the uniform-MCU path for odd-sized solid images in %s",
    async (subsampling) => {
      const source = solidSource(19, 23, [40, 120, 200]);
      const encoded = encodeJpeg(source, { quality: 92, subsampling });
      const js = decodeJpegJs(encoded);
      const skia = await decodeSkia(encoded);
      expect(maxRgbError(js.data, source.data)).toBeLessThanOrEqual(2);
      expect(maxRgbError(skia.data, source.data)).toBeLessThanOrEqual(2);
    },
  );

  test.each(SUBSAMPLING)(
    "does not treat a differing pixel in an edge MCU as uniform in %s",
    async (subsampling) => {
      const source = solidSource(19, 23, [0, 0, 0]);
      const changedOffset = (22 * source.width + 18) * 4;
      source.data[changedOffset] = 255;
      source.data[changedOffset + 1] = 255;
      source.data[changedOffset + 2] = 255;
      const encoded = encodeJpeg(source, { quality: 100, subsampling });
      const uniform = encodeJpeg(solidSource(19, 23, [0, 0, 0]), { quality: 100, subsampling });
      const js = decodeJpegJs(encoded);
      const skia = await decodeSkia(encoded);
      expect(encoded).not.toEqual(uniform);
      expect(js.data[changedOffset]).toBeGreaterThan(200);
      expect(skia.data[changedOffset]).toBeGreaterThan(200);
    },
  );

  test("matches jpeg-js fidelity and size for 4:4:4 scenes", () => {
    for (const source of [makeSource(257, 193), makeLineArt(320, 240), makeNoise(256, 192)]) {
      const ours = encodeJpeg(source, { quality: 92, subsampling: "4:4:4" });
      const reference = jpeg.encode(
        { width: source.width, height: source.height, data: source.data },
        92,
      ).data;
      const oursDecoded = jpeg.decode(ours, { useTArray: true }).data;
      const referenceDecoded = jpeg.decode(reference, { useTArray: true }).data;
      expect(
        Math.abs(yPsnr(source.data, oursDecoded) - yPsnr(source.data, referenceDecoded)),
      ).toBeLessThanOrEqual(0.5);
      expect(ours.length / reference.length).toBeGreaterThanOrEqual(0.95);
      expect(ours.length / reference.length).toBeLessThanOrEqual(1.05);

      const subsampled = encodeJpeg(source, { quality: 92, subsampling: "4:2:0" });
      expect(yPsnr(source.data, jpeg.decode(subsampled, { useTArray: true }).data)).toBeGreaterThan(
        25,
      );
    }
  });

  test("handles high-entropy coefficient and byte-stuffing cases", async () => {
    const cases = [checkerboard(31, 33), makeNoise(65, 47), tiledDcJumps(64, 32)];
    for (const source of cases) {
      for (const subsampling of SUBSAMPLING) {
        const encoded = encodeJpeg(source, { quality: 100, subsampling });
        const js = decodeJpegJs(encoded);
        const skia = await decodeSkia(encoded);
        expect([js.width, js.height, skia.width, skia.height]).toEqual([
          source.width,
          source.height,
          source.width,
          source.height,
        ]);
        expect(meanYDifference(js.data, skia.data)).toBeLessThanOrEqual(3);
        expect(maxYDifference(js.data, skia.data)).toBeLessThanOrEqual(25);
      }
    }
  });

  test("is deterministic", () => {
    const source = makeNoise(127, 91);
    expect(encodeJpeg(source, { quality: 92, subsampling: "4:2:0" })).toEqual(
      encodeJpeg(source, { quality: 92, subsampling: "4:2:0" }),
    );
  });

  test("rejects zero dimensions", () => {
    expect(() =>
      encodeJpeg(
        { width: 0, height: 1, data: new Uint8Array() },
        { quality: 92, subsampling: "4:2:0" },
      ),
    ).toThrow(RangeError);
  });
});

interface Decoded {
  readonly width: number;
  readonly height: number;
  readonly data: ArrayLike<number>;
}

function decodeJpegJs(bytes: Uint8Array): Decoded {
  return jpeg.decode(bytes, { useTArray: true });
}

async function decodeSkia(bytes: Uint8Array): Promise<Decoded> {
  const image = await loadImage(Buffer.from(bytes));
  const canvas = new SkiaCanvas(image.width, image.height);
  const context = canvas.getContext("2d");
  context.drawImage(image, 0, 0);
  return {
    width: image.width,
    height: image.height,
    data: context.getImageData(0, 0, image.width, image.height).data,
  };
}

function makeSource(width: number, height: number): JpegSource {
  const data = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const offset = (y * width + x) * 4;
      data[offset] = Math.round((x / Math.max(1, width - 1)) * 255);
      data[offset + 1] = Math.round((y / Math.max(1, height - 1)) * 255);
      data[offset + 2] = (x * 17 + y * 29) & 0xff;
      data[offset + 3] = 255;
    }
  }
  return { width, height, data };
}

function solidSource(width: number, height: number, color: readonly number[]): JpegSource {
  const data = new Uint8Array(width * height * 4);
  for (let offset = 0; offset < data.length; offset += 4) {
    data[offset] = color[0]!;
    data[offset + 1] = color[1]!;
    data[offset + 2] = color[2]!;
    data[offset + 3] = 255;
  }
  return { width, height, data };
}

function makeNoise(width: number, height: number): JpegSource {
  const data = new Uint8Array(width * height * 4);
  let state = 0x12345678;
  for (let offset = 0; offset < data.length; offset += 4) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    data[offset] = state >>> 24;
    data[offset + 1] = state >>> 16;
    data[offset + 2] = state >>> 8;
    data[offset + 3] = 255;
  }
  return { width, height, data };
}

function makeLineArt(width: number, height: number): JpegSource {
  const source = solidSource(width, height, [22, 29, 47]);
  for (let y = 0; y < height; y += 1)
    for (let x = 0; x < width; x += 1) {
      if (Math.abs(y - height / 2 - Math.sin(x * 0.08) * height * 0.25) < 4) {
        const offset = (y * width + x) * 4;
        source.data[offset] = 235;
        source.data[offset + 1] = 82;
        source.data[offset + 2] = 122;
      }
    }
  return source;
}

function checkerboard(width: number, height: number): JpegSource {
  const data = new Uint8Array(width * height * 4);
  for (let pixel = 0; pixel < width * height; pixel += 1) {
    const value = ((pixel % width) + Math.floor(pixel / width)) & 1 ? 255 : 0;
    data.fill(value, pixel * 4, pixel * 4 + 3);
    data[pixel * 4 + 3] = 255;
  }
  return { width, height, data };
}

function tiledDcJumps(width: number, height: number): JpegSource {
  const data = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y += 1)
    for (let x = 0; x < width; x += 1) {
      const value = ((x >> 3) + (y >> 3)) & 1 ? 255 : 0;
      const offset = (y * width + x) * 4;
      data[offset] = value;
      data[offset + 1] = value;
      data[offset + 2] = value;
      data[offset + 3] = 255;
    }
  return { width, height, data };
}

function maxDifference(a: ArrayLike<number>, b: ArrayLike<number>): number {
  let maximum = 0;
  for (let index = 0; index < a.length; index += 1)
    maximum = Math.max(maximum, Math.abs(a[index]! - b[index]!));
  return maximum;
}

function meanYDifference(a: ArrayLike<number>, b: ArrayLike<number>): number {
  let total = 0;
  for (let index = 0; index < a.length; index += 4) total += yDifference(a, b, index);
  return total / (a.length / 4);
}

function maxYDifference(a: ArrayLike<number>, b: ArrayLike<number>): number {
  let maximum = 0;
  for (let index = 0; index < a.length; index += 4)
    maximum = Math.max(maximum, yDifference(a, b, index));
  return maximum;
}

function yDifference(a: ArrayLike<number>, b: ArrayLike<number>, index: number): number {
  return Math.abs(
    0.299 * (a[index]! - b[index]!) +
      0.587 * (a[index + 1]! - b[index + 1]!) +
      0.114 * (a[index + 2]! - b[index + 2]!),
  );
}

function maxRgbError(actual: ArrayLike<number>, expected: ArrayLike<number>): number {
  let maximum = 0;
  for (let index = 0; index < actual.length; index += 4)
    for (let channel = 0; channel < 3; channel += 1)
      maximum = Math.max(maximum, Math.abs(actual[index + channel]! - expected[index + channel]!));
  return maximum;
}

function regionMeanError(
  actual: ArrayLike<number>,
  expected: ArrayLike<number>,
  width: number,
  height: number,
  edge: boolean,
): number {
  let error = 0;
  let count = 0;
  for (let y = 0; y < height; y += 1)
    for (let x = 0; x < width; x += 1) {
      const isEdge = x >= Math.max(0, width - 2) || y >= Math.max(0, height - 2);
      if (isEdge !== edge) continue;
      const offset = (y * width + x) * 4;
      for (let channel = 0; channel < 3; channel += 1) {
        error += Math.abs(actual[offset + channel]! - expected[offset + channel]!);
        count += 1;
      }
    }
  return count === 0 ? 0 : error / count;
}

function yPsnr(expected: ArrayLike<number>, actual: ArrayLike<number>): number {
  let squaredError = 0;
  let pixels = 0;
  for (let offset = 0; offset < expected.length; offset += 4) {
    const a =
      0.299 * expected[offset]! + 0.587 * expected[offset + 1]! + 0.114 * expected[offset + 2]!;
    const b = 0.299 * actual[offset]! + 0.587 * actual[offset + 1]! + 0.114 * actual[offset + 2]!;
    squaredError += (a - b) ** 2;
    pixels += 1;
  }
  return 10 * Math.log10((255 * 255) / (squaredError / pixels));
}

function zigzag(input: readonly number[]): Uint8Array {
  const output = new Uint8Array(64);
  for (let index = 0; index < 64; index += 1) output[ZIGZAG[index]!] = input[index]!;
  return output;
}

function parseJpeg(bytes: Uint8Array): {
  markers: number[];
  width: number;
  height: number;
  sampling: number[];
  quantization: Uint8Array[];
  entropy: Uint8Array;
} {
  const markers: number[] = [];
  const quantization: Uint8Array[] = [];
  let width = 0;
  let height = 0;
  let sampling: number[] = [];
  let offset = 0;
  let entropy = new Uint8Array();
  while (offset < bytes.length) {
    expect(bytes[offset]).toBe(0xff);
    const marker = bytes[offset + 1]!;
    markers.push(marker);
    offset += 2;
    if (marker === 0xd8) continue;
    if (marker === 0xd9) break;
    const length = (bytes[offset]! << 8) | bytes[offset + 1]!;
    const start = offset + 2;
    if (marker === 0xdb) {
      quantization.push(bytes.slice(start + 1, start + 65), bytes.slice(start + 66, start + 130));
    }
    if (marker === 0xc0) {
      height = (bytes[start + 1]! << 8) | bytes[start + 2]!;
      width = (bytes[start + 3]! << 8) | bytes[start + 4]!;
      sampling = [bytes[start + 7]!, bytes[start + 10]!, bytes[start + 13]!];
    }
    offset += length;
    if (marker === 0xda) {
      const end = bytes.length - 2;
      entropy = bytes.slice(offset, end);
      offset = end;
    }
  }
  return { markers, width, height, sampling, quantization, entropy };
}

const ZIGZAG = [
  0, 1, 5, 6, 14, 15, 27, 28, 2, 4, 7, 13, 16, 26, 29, 42, 3, 8, 12, 17, 25, 30, 41, 43, 9, 11, 18,
  24, 31, 40, 44, 53, 10, 19, 23, 32, 39, 45, 52, 54, 20, 22, 33, 38, 46, 51, 55, 60, 21, 34, 37,
  47, 50, 56, 59, 61, 35, 36, 48, 49, 57, 58, 62, 63,
] as const;
const LUMINANCE_QUANTIZATION = [
  16, 11, 10, 16, 24, 40, 51, 61, 12, 12, 14, 19, 26, 58, 60, 55, 14, 13, 16, 24, 40, 57, 69, 56,
  14, 17, 22, 29, 51, 87, 80, 62, 18, 22, 37, 56, 68, 109, 103, 77, 24, 35, 55, 64, 81, 104, 113,
  92, 49, 64, 78, 87, 103, 121, 120, 101, 72, 92, 95, 98, 112, 100, 103, 99,
] as const;
const CHROMINANCE_QUANTIZATION = [
  17, 18, 24, 47, 99, 99, 99, 99, 18, 21, 26, 66, 99, 99, 99, 99, 24, 26, 56, 99, 99, 99, 99, 99,
  47, 66, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99,
  99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99,
] as const;
