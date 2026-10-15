import jpeg from "jpeg-js";
import { Canvas as SkiaCanvas } from "skia-canvas";
import { parseArgs } from "node:util";
import { encodeJpeg, type JpegSource } from "../src/encode/jpeg.ts";
import { Canvas } from "../src/core.ts";

const { values } = parseArgs({
  args: process.argv.slice(2).filter((argument) => argument !== "--"),
  options: {
    runs: { type: "string", default: "15" },
    sizes: { type: "string", default: "1280x720,1920x1080,2048x1536" },
    scenes: { type: "string", default: "line-art,gradient,texture,transparent" },
  },
});
const runs = Math.max(15, Number(values.runs));
const sizes = values.sizes.split(",").map((value) => {
  const [width, height] = value.split("x").map(Number);
  if (!width || !height) throw new RangeError(`Invalid size: ${value}`);
  return { width, height };
});

console.log(`JPEG benchmark · median of ${runs} · Node ${process.version} · quality 0.92`);
for (const size of sizes) {
  for (const sceneName of values.scenes.split(",")) {
    const source = makeScene(sceneName, size.width, size.height);
    const skia = makeSkiaCanvas(source);
    const encoders = [
      ["tscanvas 4:2:0", () => encodeJpeg(source, { quality: 92, subsampling: "4:2:0" })],
      ["tscanvas 4:4:4", () => encodeJpeg(source, { quality: 92, subsampling: "4:4:4" })],
      ["jpeg-js", () => jpeg.encode(source, 92).data],
      ["skia-canvas 4:2:0", () => skia.toBufferSync("jpeg", { quality: 0.92, downsample: true })],
    ] as const;
    const rows = [["encoder", "time", "size", "Y-PSNR", "RGB-PSNR"]];
    for (const [name, encode] of encoders) {
      encode();
      const samples: number[] = [];
      let bytes: Uint8Array = new Uint8Array();
      for (let run = 0; run < runs; run += 1) {
        const start = performance.now();
        bytes = encode();
        samples.push(performance.now() - start);
      }
      const decoded = jpeg.decode(bytes, { useTArray: true }).data;
      rows.push([
        name,
        `${median(samples).toFixed(2)} ms`,
        `${(bytes.length / 1024).toFixed(1)} KiB`,
        `${yPsnr(source.data, decoded).toFixed(2)} dB`,
        `${rgbPsnr(source.data, decoded).toFixed(2)} dB`,
      ]);
    }
    console.log(`\n${sceneName} · ${size.width}×${size.height}`);
    printTable(rows);
  }
}

function makeSkiaCanvas(source: JpegSource): SkiaCanvas {
  const canvas = new SkiaCanvas(source.width, source.height);
  const context = canvas.getContext("2d");
  const image = context.createImageData(source.width, source.height);
  image.data.set(source.data);
  for (let offset = 3; offset < image.data.length; offset += 4) image.data[offset] = 255;
  context.putImageData(image, 0, 0);
  return canvas;
}

function makeScene(name: string, width: number, height: number): JpegSource {
  if (name === "line-art") return makeLineArt(width, height, false);
  if (name === "transparent") return makeLineArt(width, height, true);
  const data = new Uint8Array(width * height * 4);
  let random = 0x9e3779b9;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const offset = (y * width + x) * 4;
      if (name === "gradient") {
        data[offset] = (x * 255) / width;
        data[offset + 1] = (y * 255) / height;
        data[offset + 2] = ((x + y) * 255) / (width + height);
      } else if (name === "texture") {
        random = (Math.imul(random, 1664525) + 1013904223) >>> 0;
        data[offset] = ((random >>> 24) + x / 8) & 0xff;
        data[offset + 1] = ((random >>> 16) + y / 8) & 0xff;
        data[offset + 2] = ((random >>> 8) + (x + y) / 16) & 0xff;
      }
      data[offset + 3] = 255;
    }
  }
  return { width, height, data };
}

function makeLineArt(width: number, height: number, transparent: boolean): JpegSource {
  const canvas = new Canvas(width, height);
  const context = canvas.getContext("2d");
  if (!transparent) {
    context.fillStyle = "#161d2f";
    context.fillRect(0, 0, width, height);
  }
  context.strokeStyle = "#ee4e77";
  context.lineCap = "round";
  context.lineJoin = "round";
  for (let stroke = 0; stroke < 36; stroke += 1) {
    context.lineWidth = 4 + (stroke % 7) * 2;
    context.beginPath();
    for (let point = 0; point < 90; point += 1) {
      const progress = point / 89;
      const x = progress * width + Math.sin(point * 0.37 + stroke) * width * 0.025;
      const y =
        height * (0.08 + (stroke / 36) * 0.84) +
        Math.sin(progress * Math.PI * (3 + (stroke % 6)) + stroke * 0.71) * height * 0.14;
      if (point === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.stroke();
  }
  return { width, height, data: canvas.pixels };
}

function yPsnr(expected: ArrayLike<number>, actual: ArrayLike<number>): number {
  let error = 0;
  for (let offset = 0; offset < expected.length; offset += 4) {
    const a =
      0.299 * expected[offset]! + 0.587 * expected[offset + 1]! + 0.114 * expected[offset + 2]!;
    const b = 0.299 * actual[offset]! + 0.587 * actual[offset + 1]! + 0.114 * actual[offset + 2]!;
    error += (a - b) ** 2;
  }
  return 10 * Math.log10((255 * 255) / (error / (expected.length / 4)));
}

function rgbPsnr(expected: ArrayLike<number>, actual: ArrayLike<number>): number {
  let error = 0;
  for (let offset = 0; offset < expected.length; offset += 4) {
    for (let channel = 0; channel < 3; channel += 1) {
      error += (expected[offset + channel]! - actual[offset + channel]!) ** 2;
    }
  }
  return 10 * Math.log10((255 * 255) / (error / ((expected.length / 4) * 3)));
}

function median(values: number[]): number {
  return values.sort((a, b) => a - b)[Math.floor(values.length / 2)]!;
}

function printTable(rows: string[][]): void {
  const widths = rows[0]!.map((_, column) => Math.max(...rows.map((row) => row[column]!.length)));
  for (const [index, row] of rows.entries()) {
    console.log(`| ${row.map((cell, column) => cell.padEnd(widths[column]!)).join(" | ")} |`);
    if (index === 0) console.log(`|-${widths.map((width) => "-".repeat(width)).join("-|-")}-|`);
  }
}
