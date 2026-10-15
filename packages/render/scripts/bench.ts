/**
 * Benchmarks the server render backends on GML documents and prints the results as tables.
 *
 *   node scripts/bench.ts [options] [file.gml ...]
 *
 * Without files, it uses the documents in tests/data. Run with --help for the options.
 */
import { readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs, styleText } from "node:util";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import { GMLRenderer, GMLView } from "../src/index.ts";
import { ServerRenderContext, type ServerRenderContextType } from "../src/server/index.ts";
import type { RenderContextBase } from "../src/render/context.ts";

const BACKENDS: ServerRenderContextType[] = [
  "gmljs-canvas",
  "node-canvas",
  "skia-canvas",
  "pureimage",
];
const REFERENCE: ServerRenderContextType = "skia-canvas";

const { values: options, positionals: files } = parseArgs({
  // Some script runners forward a "--" separator; it carries no meaning here.
  args: process.argv.slice(2).filter((arg) => arg !== "--"),
  allowPositionals: true,
  options: {
    width: { type: "string", default: "1024" },
    height: { type: "string", default: "768" },
    runs: { type: "string", default: "5" },
    frames: { type: "string", default: "30" },
    backends: { type: "string", default: BACKENDS.join(",") },
    help: { type: "boolean", short: "h", default: false },
  },
});

if (options.help) {
  console.log(`Usage: node scripts/bench.ts [options] [file.gml ...]

Options:
  --width <px>        Canvas width (default 1024)
  --height <px>       Canvas height (default 768)
  --runs <n>          Timed runs per measurement; the median is reported (default 5)
  --frames <n>        Animation frames to render, 0 to skip (default 30)
  --backends <list>   Comma-separated backends (default ${BACKENDS.join(",")})`);
  process.exit(0);
}

const width = positiveInt("width");
const height = positiveInt("height");
const runs = positiveInt("runs");
const frames = Number(options.frames);
const backends = options.backends
  .split(",")
  .map((name) => name.trim()) as ServerRenderContextType[];
for (const backend of backends) {
  if (!BACKENDS.includes(backend)) {
    fail(`Unknown backend "${backend}" (expected ${BACKENDS.join(", ")})`);
  }
}

function positiveInt(name: "width" | "height" | "runs") {
  const value = Number(options[name]);
  if (!Number.isInteger(value) || value <= 0) {
    fail(`--${name} must be a positive integer`);
  }
  return value;
}

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

// --- Output helpers ------------------------------------------------------------------

const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
type Style = Parameters<typeof styleText>[0];
const style = (format: Style, text: string) => (useColor ? styleText(format, text) : text);

function progress(text: string) {
  if (process.stderr.isTTY) {
    process.stderr.write(`\r\x1b[2K${style("dim", text)}`);
  }
}

interface Column {
  header: string;
  align?: "left" | "right";
}

interface Cell {
  text: string;
  style?: Style;
}

function printTable(columns: Column[], rows: Cell[][]) {
  const widths = columns.map((column, i) =>
    Math.max(column.header.length, ...rows.map((row) => row[i]!.text.length)),
  );
  const pad = (text: string, i: number) =>
    columns[i]!.align === "left" ? text.padEnd(widths[i]!) : text.padStart(widths[i]!);
  const line = (left: string, mid: string, right: string) =>
    style("dim", left + widths.map((w) => "─".repeat(w + 2)).join(mid) + right);
  const bar = style("dim", "│");

  console.log(line("┌", "┬", "┐"));
  console.log(
    `${bar} ${columns.map((c, i) => style("bold", pad(c.header, i))).join(` ${bar} `)} ${bar}`,
  );
  console.log(line("├", "┼", "┤"));
  for (const row of rows) {
    const cells = row.map((cell, i) => {
      const text = pad(cell.text, i);
      return cell.style ? style(cell.style, text) : text;
    });
    console.log(`${bar} ${cells.join(` ${bar} `)} ${bar}`);
  }
  console.log(line("└", "┴", "┘"));
}

const ms = (value: number) => (value < 10 ? `${value.toFixed(1)} ms` : `${Math.round(value)} ms`);

// --- Measurements --------------------------------------------------------------------

function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
}

async function time(fn: () => unknown) {
  const start = performance.now();
  await fn();
  return performance.now() - start;
}

interface Result {
  draw: number;
  png: number;
  /** Undefined for backends that cannot encode JPEG (gmljs-canvas). */
  jpeg?: number;
  /** Median ms per animation frame (draw + JPEG encode, else PNG), or undefined when skipped. */
  frame?: number;
  image: Buffer;
}

async function benchmark(gml: string, type: ServerRenderContextType): Promise<Result> {
  const context: RenderContextBase = ServerRenderContext.createRenderContext({
    type,
    width,
    height,
  });
  const view = new GMLView(gml, new GMLRenderer(context));
  const draw = () => {
    view.setPosition(1);
    view.draw();
  };
  const png = () => context.renderToArrayBuffer({ type: "png" });
  const jpeg = () => context.renderToArrayBuffer({ type: "jpeg", quality: 0.9 });

  // Warm up (JIT, lazily loaded modules, font and encoder setup).
  draw();
  const image = Buffer.from(await png());
  const hasJpeg = await jpeg().then(
    () => true,
    () => false,
  );
  const encodeFrame = hasJpeg ? jpeg : png;

  const samples = {
    draw: [] as number[],
    png: [] as number[],
    jpeg: [] as number[],
  };
  for (let i = 0; i < runs; i += 1) {
    progress(`${type}: still image ${i + 1}/${runs}`);
    samples.draw.push(await time(draw));
    samples.png.push(await time(png));
    // Draw again, so lazy backends (skia-canvas) rasterize inside the JPEG timing too.
    if (hasJpeg) {
      draw();
      samples.jpeg.push(await time(jpeg));
    }
  }

  let frame: number | undefined;
  if (frames > 0) {
    const frameTimes: number[] = [];
    for (let i = 0; i < frames; i += 1) {
      progress(`${type}: animation frame ${i + 1}/${frames}`);
      frameTimes.push(
        await time(async () => {
          view.setPosition(frames === 1 ? 1 : i / (frames - 1));
          view.draw();
          await encodeFrame();
        }),
      );
    }
    frame = median(frameTimes);
  }

  return {
    draw: median(samples.draw),
    png: median(samples.png),
    jpeg: hasJpeg ? median(samples.jpeg) : undefined,
    frame,
    image,
  };
}

/**
 * Fraction of the reference's ink (dark) pixels that differ in `image`. Relative to the
 * ink rather than the whole canvas, since strokes usually cover a small part of it.
 */
function difference(reference: Buffer, image: Buffer) {
  const a = PNG.sync.read(reference);
  const b = PNG.sync.read(image);
  let ink = 0;
  for (let i = 0; i < a.data.length; i += 4) {
    if (a.data[i]! < 128) {
      ink += 1;
    }
  }
  if (ink === 0) {
    return undefined;
  }
  return (
    pixelmatch(a.data, b.data, undefined, a.width, a.height, {
      threshold: 0.1,
    }) / ink
  );
}

// --- Main ----------------------------------------------------------------------------

const dataDir = fileURLToPath(new URL("../tests/data/", import.meta.url));
const documents = files.length
  ? files
  : readdirSync(dataDir)
      .filter((name) => name.endsWith(".xml"))
      .sort()
      .map((name) => join(dataDir, name));

console.log(
  style("bold", "gmlrender backend benchmark") +
    style(
      "dim",
      ` · ${width}×${height} · median of ${runs} runs` +
        (frames > 0 ? ` · ${frames} animation frames` : "") +
        ` · Node ${process.version}`,
    ),
);

for (const file of documents) {
  const gml = readFileSync(file, "utf8");
  console.log(`\n${style("cyan", basename(file))}`);

  const results = new Map<ServerRenderContextType, Result | Error>();
  for (const type of backends) {
    try {
      results.set(type, await benchmark(gml, type));
    } catch (error) {
      results.set(type, error instanceof Error ? error : new Error(String(error)));
    }
  }
  progress("");
  if (process.stderr.isTTY) {
    process.stderr.write("\r");
  }

  const succeeded = [...results.values()].filter(
    (result): result is Result => !(result instanceof Error),
  );
  const fastest = Math.min(...succeeded.map((r) => r.draw + r.png));
  const reference = results.get(REFERENCE);

  const columns: Column[] = [
    { header: "Backend", align: "left" },
    { header: "Draw" },
    { header: "PNG" },
    { header: "JPEG" },
    { header: "Image (draw+PNG)" },
    { header: "Relative" },
    ...(frames > 0 ? [{ header: "Frame (draw+JPEG)" }, { header: "FPS" }] : []),
    { header: `Diff vs ${REFERENCE}` },
  ];

  const rows = backends.map((type): Cell[] => {
    const result = results.get(type)!;
    if (result instanceof Error) {
      const reason = result.message.includes("requires the optional")
        ? "not installed"
        : `failed: ${result.message}`;
      return [
        { text: type },
        { text: reason, style: "red" },
        ...columns.slice(2).map(() => ({ text: "" })),
      ];
    }
    const total = result.draw + result.png;
    const relative = total / fastest;
    let diff: Cell;
    if (type === REFERENCE) {
      diff = { text: "reference", style: "dim" };
    } else if (!reference || reference instanceof Error) {
      diff = { text: "–", style: "dim" };
    } else {
      const value = difference(reference.image, result.image);
      diff =
        value === undefined
          ? { text: "–", style: "dim" }
          : {
              text: `${(value * 100).toFixed(1)}%`,
              style: value < 0.02 ? "green" : value < 0.1 ? "yellow" : "red",
            };
    }
    return [
      { text: type, style: "bold" },
      { text: ms(result.draw) },
      { text: ms(result.png) },
      result.jpeg === undefined ? { text: "–", style: "dim" } : { text: ms(result.jpeg) },
      { text: ms(total), style: "bold" },
      {
        text: `${relative.toFixed(1)}×`,
        style: relative < 1.5 ? "green" : relative < 5 ? "yellow" : "red",
      },
      ...(result.frame === undefined
        ? []
        : [{ text: ms(result.frame) }, { text: (1000 / result.frame).toFixed(1) }]),
      diff,
    ];
  });

  printTable(columns, rows);
}

console.log(
  style(
    "dim",
    `
Draw: render the finished tag. PNG/JPEG: encode it (JPEG quality 0.9).
skia-canvas rasterizes lazily, so its drawing cost shows up in the encode columns.
Frame: draw + JPEG encode at evenly spaced animation positions, as when rendering video
(PNG for backends without JPEG, such as gmljs-canvas).
Diff: share of the reference's ink pixels that differ (pixelmatch, threshold 0.1).`,
  ),
);
