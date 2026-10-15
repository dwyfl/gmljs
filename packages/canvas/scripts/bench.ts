import { Canvas as SkiaCanvas } from "skia-canvas";
import { Canvas } from "../src/node.ts";

const WIDTH = 1024;
const HEIGHT = 768;

interface Measurements {
  clear: number;
  fill: number;
  translucentFill: number;
  pathFill: number;
  stroke: number;
  png: number;
  jpeg: number;
}

const ours = await benchmarkOurs();
const skia = await benchmarkSkia();

console.log(`Milestone 4 · ${WIDTH}×${HEIGHT} · median · Node ${process.version}`);
printTable([
  ["backend", "clear", "opaque fill", "alpha fill", "path fill", "GML-like stroke", "PNG", "JPEG"],
  [
    "tscanvas",
    ms(ours.clear),
    ms(ours.fill),
    ms(ours.translucentFill),
    ms(ours.pathFill),
    ms(ours.stroke),
    ms(ours.png),
    ms(ours.jpeg),
  ],
  [
    "skia-canvas",
    ms(skia.clear),
    ms(skia.fill),
    ms(skia.translucentFill),
    ms(skia.pathFill),
    ms(skia.stroke),
    ms(skia.png),
    ms(skia.jpeg),
  ],
]);
console.log("Drawing cells are API-call time; skia-canvas may defer raster work until encode.");

console.log("\nTiny-path scaling · 3-point triangle · median");
printTable([
  ["canvas", "tiny fill"],
  ...[
    [64, 64],
    [1024, 768],
    [2048, 1536],
  ].map(([width, height]) => [`${width}×${height}`, ms(benchmarkTinyFill(width!, height!))]),
]);

async function benchmarkOurs(): Promise<Measurements> {
  const canvas = new Canvas(WIDTH, HEIGHT);
  const context = canvas.getContext("2d");
  context.fillStyle = "#315ca8";
  context.fillRect(0, 0, WIDTH, HEIGHT);
  const clear = measureSync(() => context.clearRect(0, 0, WIDTH, HEIGHT), 100);
  context.fillStyle = "#315ca8";
  const fill = measureSync(() => context.fillRect(0, 0, WIDTH, HEIGHT), 100);
  context.fillStyle = "rgba(49, 92, 168, 0.5)";
  const translucentFill = measureSync(() => context.fillRect(0, 0, WIDTH, HEIGHT), 20);
  makeBackgroundPath(context);
  context.fillStyle = "#315ca8";
  const pathFill = measureSync(() => context.fill(), 20);
  makeTagPath(context);
  context.strokeStyle = "#17223d";
  context.lineWidth = 4;
  context.lineCap = "round";
  context.lineJoin = "round";
  const stroke = measureSync(() => context.stroke(), 20);
  const png = await measureAsync(() => canvas.encode(), 5);
  const jpeg = await measureAsync(() => canvas.encode({ format: "jpeg", quality: 0.92 }), 5);
  return { clear, fill, translucentFill, pathFill, stroke, png, jpeg };
}

async function benchmarkSkia(): Promise<Measurements> {
  const canvas = new SkiaCanvas(WIDTH, HEIGHT);
  const context = canvas.getContext("2d");
  context.fillStyle = "#315ca8";
  context.fillRect(0, 0, WIDTH, HEIGHT);
  const clear = measureSync(() => context.clearRect(0, 0, WIDTH, HEIGHT), 100);
  context.fillStyle = "#315ca8";
  const fill = measureSync(() => context.fillRect(0, 0, WIDTH, HEIGHT), 100);
  context.fillStyle = "rgba(49, 92, 168, 0.5)";
  const translucentFill = measureSync(() => context.fillRect(0, 0, WIDTH, HEIGHT), 20);
  makeBackgroundPath(context);
  context.fillStyle = "#315ca8";
  const pathFill = measureSync(() => context.fill(), 20);
  makeTagPath(context);
  context.strokeStyle = "#17223d";
  context.lineWidth = 4;
  context.lineCap = "round";
  context.lineJoin = "round";
  const stroke = measureSync(() => context.stroke(), 20);
  const png = await measureAsync(() => Promise.resolve(canvas.toBufferSync("png")), 5);
  const jpeg = await measureAsync(
    () => Promise.resolve(canvas.toBufferSync("jpeg", { quality: 0.92 })),
    5,
  );
  return { clear, fill, translucentFill, pathFill, stroke, png, jpeg };
}

interface PathFillContext {
  beginPath(): void;
  moveTo(x: number, y: number): void;
  lineTo(x: number, y: number): void;
  closePath(): void;
  fill(): void;
  stroke(): void;
}

function makeTagPath(context: PathFillContext): void {
  context.beginPath();
  for (let index = 0; index < 420; index += 1) {
    const progress = index / 419;
    const angle = progress * Math.PI * 18;
    const radius = 55 + progress * 290 + Math.sin(index * 0.73) * 34;
    const x = WIDTH / 2 + Math.cos(angle) * radius;
    const y = HEIGHT / 2 + Math.sin(angle * 1.13) * radius * 0.68;
    if (index === 0) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  }
}

function benchmarkTinyFill(width: number, height: number): number {
  const canvas = new Canvas(width, height);
  const context = canvas.getContext("2d");
  context.beginPath();
  context.moveTo(3.25, 3.25);
  context.lineTo(27.75, 8.5);
  context.lineTo(11.5, 29.75);
  context.closePath();
  return measureSync(() => context.fill(), width <= 64 ? 1000 : 20);
}

function makeBackgroundPath(context: PathFillContext): void {
  context.beginPath();
  context.moveTo(-73.25, 81.5);
  context.lineTo(903.75, -96.25);
  context.lineTo(1104.5, 687.75);
  context.lineTo(121.25, 856.5);
  context.closePath();
}

function measureSync(operation: () => void, iterations: number): number {
  for (let i = 0; i < 10; i += 1) {
    operation();
  }
  const samples: number[] = [];
  for (let sample = 0; sample < 7; sample += 1) {
    const start = performance.now();
    for (let i = 0; i < iterations; i += 1) {
      operation();
    }
    samples.push((performance.now() - start) / iterations);
  }
  return median(samples);
}

async function measureAsync(operation: () => Promise<unknown>, runs: number): Promise<number> {
  await operation();
  const samples: number[] = [];
  for (let i = 0; i < runs; i += 1) {
    const start = performance.now();
    await operation();
    samples.push(performance.now() - start);
  }
  return median(samples);
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)]!;
}

function ms(value: number): string {
  return value < 0.1 ? `${(value * 1000).toFixed(1)} µs` : `${value.toFixed(2)} ms`;
}

function printTable(rows: string[][]): void {
  const widths = rows[0]!.map((_, column) => Math.max(...rows.map((row) => row[column]!.length)));
  for (const [rowIndex, row] of rows.entries()) {
    console.log(`| ${row.map((cell, column) => cell.padEnd(widths[column]!)).join(" | ")} |`);
    if (rowIndex === 0) {
      console.log(`|-${widths.map((width) => "-".repeat(width)).join("-|-")}-|`);
    }
  }
}
