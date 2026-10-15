import { expect, test } from "vite-plus/test";
import { Canvas } from "../src/node.ts";
import { boxDownsample, compareImages, decodePng, rgbaImage } from "./image-metrics.ts";
import { createSkiaCanvas } from "./skia.ts";

test("a fractional collinear round join matches one uninterrupted segment", () => {
  const single = horizontalStroke(false);
  const joined = horizontalStroke(true);
  expect(joined.pixels).toEqual(single.pixels);
});

test("a shallow fractional round join matches a 16x box-filtered reference", async () => {
  const ours = new Canvas(64, 32);
  drawShallowJoin(ours.getContext("2d"));
  const scale = 16;
  const skia = createSkiaCanvas(64 * scale, 32 * scale);
  drawShallowJoin(skia.getContext("2d"), scale);
  const groundTruth = boxDownsample(
    rgbaImage(skia.width, skia.height, skia.toBufferSync("raw", { colorType: "rgba" })),
    scale,
  );
  const metrics = compareImages(decodePng(await ours.encode()), groundTruth);
  expect(Math.abs(metrics.inkMassBias)).toBeLessThanOrEqual(0.003);
  expect(metrics.maxAbsoluteDifference).toBeLessThanOrEqual(10);
});

test("round caps and joins match their 16x box-filtered area", async () => {
  const width = 160;
  const height = 140;
  const ours = new Canvas(width, height);
  drawRoundGeometry(ours.getContext("2d"));

  const scale = 16;
  const skia = createSkiaCanvas(width * scale, height * scale);
  drawRoundGeometry(skia.getContext("2d"), scale);
  const groundTruth = boxDownsample(
    rgbaImage(skia.width, skia.height, skia.toBufferSync("raw", { colorType: "rgba" })),
    scale,
  );
  const metrics = compareImages(decodePng(await ours.encode()), groundTruth);
  expect(Math.abs(metrics.inkMassBias)).toBeLessThanOrEqual(0.001);
  expect(metrics.meanAbsoluteDifference).toBeLessThanOrEqual(0.75);
  expect(metrics.maxAbsoluteDifference).toBeLessThanOrEqual(16);
});

function horizontalStroke(withJoin: boolean): Canvas {
  const canvas = new Canvas(32, 20);
  const context = canvas.getContext("2d");
  context.lineWidth = 5;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.beginPath();
  context.moveTo(2.25, 9.375);
  if (withJoin) {
    context.lineTo(16, 9.375);
  }
  context.lineTo(29.75, 9.375);
  context.stroke();
  return canvas;
}

interface StrokeContext {
  lineWidth: number;
  lineCap: "butt" | "round" | "square";
  lineJoin: "bevel" | "miter" | "round";
  beginPath(): void;
  moveTo(x: number, y: number): void;
  lineTo(x: number, y: number): void;
  stroke(): void;
}

function drawShallowJoin(context: StrokeContext, scale = 1): void {
  context.lineWidth = 5 * scale;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.moveTo(2.25 * scale, 12.375 * scale);
  context.lineTo(32 * scale, 12.875 * scale);
  context.lineTo(61.75 * scale, 12.375 * scale);
  context.stroke();
}

function drawRoundGeometry(context: StrokeContext, scale = 1): void {
  context.lineCap = "round";
  context.lineJoin = "round";
  for (const [index, width] of [2, 3, 5, 9, 17, 33].entries()) {
    const x = (18 + (index % 3) * 52) * scale;
    const y = (18 + Math.floor(index / 3) * 55) * scale;
    context.lineWidth = width * scale;
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x, y);
    context.stroke();
  }

  context.lineWidth = 11 * scale;
  context.beginPath();
  context.moveTo(10 * scale, 120 * scale);
  context.lineTo(55 * scale, 120 * scale);
  context.stroke();
  context.beginPath();
  context.moveTo(80 * scale, 130 * scale);
  context.lineTo(105 * scale, 105 * scale);
  context.lineTo(140 * scale, 130 * scale);
  context.stroke();
}
