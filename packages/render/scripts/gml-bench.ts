import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, extname, join, resolve } from "node:path";
import { parseArgs } from "node:util";
import type { RenderContextBase } from "../src/render/context.ts";
import { ServerRenderContext } from "../src/server/index.ts";
import {
  createGmlView,
  GML_DATA,
  renderGml,
  RenderContextSkiaReference,
} from "../tests/helpers/gml-compare.ts";
import {
  boxDownsample,
  compareImages,
  cropImage,
  decodePng,
  encodePng,
  makeDifferenceHeatmap,
  pixelHash,
  rgbaImage,
  type DecodedImage,
} from "../tests/helpers/image-metrics.ts";

const BACKENDS = ["gmljs-canvas", "node-canvas", "skia-canvas", "pureimage"] as const;
type Backend = (typeof BACKENDS)[number];

interface Size {
  readonly width: number;
  readonly height: number;
}

interface DocumentInput {
  readonly name: string;
  readonly path: string;
  readonly animate: boolean;
}

interface Result {
  readonly draw: number;
  readonly png: number;
  readonly endToEnd: number;
  readonly jpeg: number;
  readonly jpegEndToEnd: number;
  readonly animationFrame?: number;
  readonly pngBytes: Buffer;
  readonly jpegBytes: Buffer;
  readonly image: DecodedImage;
}

const { values, positionals } = parseArgs({
  args: process.argv.slice(2).filter((argument) => argument !== "--"),
  allowPositionals: true,
  options: {
    sizes: { type: "string", default: "1024x768" },
    runs: { type: "string", default: "7" },
    frames: { type: "string", default: "60" },
    backends: { type: "string", default: BACKENDS.join(",") },
    "ground-truth-scale": { type: "string", default: "0" },
    "report-dir": { type: "string" },
  },
});

const sizes = values.sizes.split(",").map(parseSize);
const runs = positiveInteger(values.runs, "runs");
const frames = nonNegativeInteger(values.frames, "frames");
const groundTruthScale = nonNegativeInteger(values["ground-truth-scale"], "ground-truth-scale");
const reportDirectory = values["report-dir"] ? resolve(values["report-dir"]) : undefined;
const backends = values.backends.split(",").map((value) => value.trim()) as Backend[];
for (const backend of backends) {
  if (!BACKENDS.includes(backend)) {
    throw new Error(`Unknown backend: ${backend}`);
  }
}
if (!backends.includes("skia-canvas")) {
  throw new Error("The benchmark backend list must include skia-canvas as its reference");
}

const documents = positionals.length > 0 ? positionals.map(documentInput) : defaultCorpus();

for (const size of sizes) {
  for (const document of documents) {
    await benchmarkDocument(document, size);
  }
}

async function benchmarkDocument(document: DocumentInput, size: Size): Promise<void> {
  const xml = readFileSync(document.path, "utf8");
  const results = new Map<Backend, Result>();
  for (const backend of backends) {
    results.set(backend, await benchmarkBackend(backend, xml, size, document.animate ? frames : 0));
  }

  const reference = results.get("skia-canvas")!.image;
  const groundTruth =
    groundTruthScale > 1 ? renderGroundTruth(xml, size, groundTruthScale) : undefined;

  console.log(
    `GML benchmark · ${document.name} · ${size.width}×${size.height} · median of ${runs} · Node ${process.version}`,
  );
  printTable([
    [
      "backend",
      "draw",
      "PNG",
      "draw + PNG",
      "JPEG",
      "draw + JPEG",
      "anim/frame",
      "ink bias",
      "mean |Δ|",
      "max |Δ|",
      ">16",
      "GT mean |Δ|",
    ],
    ...backends.map((backend) => {
      const result = results.get(backend)!;
      const metrics = compareImages(result.image, reference);
      const groundTruthDistance = groundTruth
        ? compareImages(result.image, groundTruth).meanAbsoluteDifference
        : undefined;
      return [
        backend,
        milliseconds(result.draw),
        milliseconds(result.png),
        milliseconds(result.endToEnd),
        milliseconds(result.jpeg),
        milliseconds(result.jpegEndToEnd),
        result.animationFrame === undefined ? "—" : milliseconds(result.animationFrame),
        percentage(metrics.inkMassBias),
        metrics.meanAbsoluteDifference.toFixed(2),
        metrics.maxAbsoluteDifference.toFixed(0),
        percentage(metrics.shareOver16),
        groundTruthDistance?.toFixed(2) ?? "—",
      ];
    }),
  ]);
  for (const backend of backends) {
    const result = results.get(backend)!;
    console.log(
      `${backend}: PNG ${(result.pngBytes.length / 1024).toFixed(1)} KiB, JPEG ${(result.jpegBytes.length / 1024).toFixed(1)} KiB, pixels ${pixelHash(result.image).slice(0, 16)}`,
    );
  }
  console.log("Red heatmap pixels mean over-coverage; blue pixels mean under-coverage.\n");

  if (reportDirectory) {
    writeReport(document, size, results, reference, groundTruth);
  }
}

async function benchmarkBackend(
  backend: Backend,
  xml: string,
  size: Size,
  animationFrames: number,
): Promise<Result> {
  const context = createContext(backend, size);
  const view = createGmlView(xml, context);
  view.setPosition(1);
  const draw = () => view.draw();
  const png = () => context.renderToArrayBuffer({ type: "png" });
  const jpeg = () => context.renderToArrayBuffer({ type: "jpeg", quality: 0.92 });

  draw();
  await png();
  await jpeg();

  const drawSamples: number[] = [];
  const pngSamples: number[] = [];
  const endToEndSamples: number[] = [];
  const jpegSamples: number[] = [];
  const jpegEndToEndSamples: number[] = [];
  let pngBytes = Buffer.alloc(0);
  let jpegBytes = Buffer.alloc(0);
  for (let run = 0; run < runs; run += 1) {
    drawSamples.push(timeSync(draw));
    draw();
    const encoded = await timeAsync(png);
    pngSamples.push(encoded.elapsed);
    draw();
    const jpegEncoded = await timeAsync(jpeg);
    jpegSamples.push(jpegEncoded.elapsed);

    const complete = await timeAsync(async () => {
      draw();
      return png();
    });
    endToEndSamples.push(complete.elapsed);
    pngBytes = Buffer.from(complete.value);

    const jpegComplete = await timeAsync(async () => {
      draw();
      return jpeg();
    });
    jpegEndToEndSamples.push(jpegComplete.elapsed);
    jpegBytes = Buffer.from(jpegComplete.value);
  }

  let animationFrame: number | undefined;
  if (animationFrames > 0) {
    const animationSamples: number[] = [];
    for (let frame = 0; frame < animationFrames; frame += 1) {
      view.setPosition(animationFrames === 1 ? 1 : frame / (animationFrames - 1));
      const sample = await timeAsync(async () => {
        draw();
        await png();
      });
      animationSamples.push(sample.elapsed);
    }
    animationFrame = median(animationSamples);
  }

  return {
    draw: median(drawSamples),
    png: median(pngSamples),
    endToEnd: median(endToEndSamples),
    jpeg: median(jpegSamples),
    jpegEndToEnd: median(jpegEndToEndSamples),
    animationFrame,
    pngBytes,
    jpegBytes,
    image: decodePng(pngBytes),
  };
}

function renderGroundTruth(xml: string, size: Size, scale: number): DecodedImage {
  // @gmljs/render projects both coordinates and brush widths from the context dimensions,
  // so enlarging the target applies the same uniform transform to geometry and strokes.
  const context = new RenderContextSkiaReference(size.width * scale, size.height * scale);
  renderGml(xml, context);
  const highResolution = rgbaImage(context.width, context.height, context.rawRgba());
  return boxDownsample(highResolution, scale);
}

function createContext(backend: Backend, size: Size): RenderContextBase {
  if (backend === "skia-canvas") {
    // Pinned to Skia's CPU rasterizer: it is the accuracy reference, and GPU output differs.
    return new RenderContextSkiaReference(size.width, size.height);
  }
  return ServerRenderContext.createRenderContext({
    type: backend,
    width: size.width,
    height: size.height,
  });
}

function writeReport(
  document: DocumentInput,
  size: Size,
  results: ReadonlyMap<Backend, Result>,
  reference: DecodedImage,
  groundTruth: DecodedImage | undefined,
): void {
  const documentDirectory = join(reportDirectory!, `${size.width}x${size.height}`, document.name);
  mkdirSync(documentDirectory, { recursive: true });
  writeFileSync(join(documentDirectory, "skia.png"), encodePng(reference));
  if (groundTruth) {
    writeFileSync(join(documentDirectory, "ground-truth.png"), encodePng(groundTruth));
  }
  for (const backend of backends) {
    if (backend === "skia-canvas") {
      continue;
    }
    const result = results.get(backend)!;
    const metrics = compareImages(result.image, reference);
    const directory = join(documentDirectory, backend);
    mkdirSync(directory, { recursive: true });
    writeFileSync(join(directory, "candidate.png"), result.pngBytes);
    writeFileSync(join(directory, "heatmap.png"), makeDifferenceHeatmap(result.image, reference));
    writeFileSync(
      join(directory, "candidate-worst.png"),
      cropImage(result.image, metrics.worstX, metrics.worstY),
    );
    writeFileSync(
      join(directory, "skia-worst.png"),
      cropImage(reference, metrics.worstX, metrics.worstY),
    );
    if (groundTruth) {
      writeFileSync(
        join(directory, "ground-truth-worst.png"),
        cropImage(groundTruth, metrics.worstX, metrics.worstY),
      );
    }
  }
}

function defaultCorpus(): DocumentInput[] {
  const examples = readdirSync(GML_DATA)
    .filter((name) => name.endsWith(".xml"))
    .sort()
    .map((name) => documentInput(join(GML_DATA, name)));
  const real = ["414.gml", "409.gml", "158.gml", "20312.gml", "19938.gml", "18476.gml"].map(
    (name) => documentInput(join(GML_DATA, name)),
  );
  return [...examples, ...real];
}

function documentInput(path: string): DocumentInput {
  const absolutePath = resolve(path);
  const name = basename(absolutePath, extname(absolutePath));
  return { name, path: absolutePath, animate: name === "414" };
}

function parseSize(value: string): Size {
  const match = /^(\d+)x(\d+)$/.exec(value.trim());
  if (!match) {
    throw new RangeError(`Invalid size: ${value}`);
  }
  return {
    width: positiveInteger(match[1], "width"),
    height: positiveInteger(match[2], "height"),
  };
}

function timeSync(operation: () => void): number {
  const start = performance.now();
  operation();
  return performance.now() - start;
}

async function timeAsync<T>(operation: () => Promise<T>): Promise<{ elapsed: number; value: T }> {
  const start = performance.now();
  const value = await operation();
  return { elapsed: performance.now() - start, value };
}

function median(values: readonly number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)]!;
}

function positiveInteger(value: string | undefined, name: string): number {
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number <= 0) {
    throw new RangeError(`${name} must be a positive integer`);
  }
  return number;
}

function nonNegativeInteger(value: string | undefined, name: string): number {
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < 0) {
    throw new RangeError(`${name} must be a non-negative integer`);
  }
  return number;
}

function milliseconds(value: number): string {
  return value < 0.1 ? `${(value * 1000).toFixed(1)} µs` : `${value.toFixed(2)} ms`;
}

function percentage(value: number): string {
  return `${value < 0 ? "" : "+"}${(value * 100).toFixed(2)}%`;
}

function printTable(rows: string[][]): void {
  const widths = rows[0]!.map((_, column) => Math.max(...rows.map((row) => row[column]!.length)));
  for (const [rowIndex, row] of rows.entries()) {
    console.log(`| ${row.map((cell, column) => cell.padEnd(widths[column]!)).join(" | ")} |`);
    if (rowIndex === 0) {
      console.log(`|-${widths.map((column) => "-".repeat(column)).join("-|-")}-|`);
    }
  }
}
