import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { describe, expect, test } from "vite-plus/test";
import { ServerRenderContext } from "@gmljs/render/server";
import {
  GML_DATA,
  renderGml,
  RenderContextSkiaRaw,
  RenderContextTscanvas,
} from "./gmlrender-adapter.ts";
import { compareImages, decodePng, pixelHash } from "./image-metrics.ts";

const documents = readdirSync(GML_DATA)
  .filter((name) => name.endsWith(".xml"))
  .sort();

describe("gmlrender adapter", () => {
  test.each(documents)("%s differs from skia-canvas by at most 1% of ink pixels", async (name) => {
    const xml = readFileSync(join(GML_DATA, name), "utf8");
    const ours = new RenderContextTscanvas(1024, 768);
    renderGml(xml, ours);
    const oursPng = Buffer.from(await ours.renderToArrayBuffer({ type: "png" }));

    const skia = new RenderContextSkiaRaw(1024, 768);
    renderGml(xml, skia);
    const skiaPng = Buffer.from(await skia.renderToArrayBuffer({ type: "png" }));

    if (process.env.GML_REVIEW_OUTPUT === "1") {
      writeReviewImages(oursPng, skiaPng, basename(name, ".xml"));
    }
    const result = comparePngs(oursPng, skiaPng, basename(name, ".xml"));
    if (process.env.GML_REFERENCE_REPORT === "1") {
      console.log(
        `${name}: ${result.differentPixels}/${result.inkPixels} (${(result.ratio * 100).toFixed(3)}%)`,
      );
    }
    expect(result.ratio, result.artifactDirectory).toBeLessThanOrEqual(0.01);
  });

  for (const [name, path] of [
    ["example001", join(GML_DATA, "example001.xml")],
    ["example002", join(GML_DATA, "example002.xml")],
  ] as const) {
    test.fails(`${name} meets the strict stroke-accuracy targets`, async () => {
      await expectStrictStrokeAccuracy(path);
    });
  }

  test("414 meets the strict stroke-accuracy targets", async () => {
    await expectStrictStrokeAccuracy(join(GML_DATA, "414.gml"));
  });

  test.each([
    [
      "example-brush",
      join(GML_DATA, "example-brush.xml"),
      "f707b022e4936c46b46f9dbe72c82809a2b51b9baae1aad1df9ab4ac31b14d39",
    ],
    [
      "example001",
      join(GML_DATA, "example001.xml"),
      "f7facba799e2a24ffef0fe8ccd2bb4d0812220ff1204a08a32b8cee086687be5",
    ],
    [
      "example002",
      join(GML_DATA, "example002.xml"),
      "f027797b6d920250e2960a4ec10dafcbc1e1fadbf0bab70c308d34d03771c478",
    ],
    [
      "414",
      join(GML_DATA, "414.gml"),
      "4c105aaf9b0eca9fb9a0bbcf4179616a6c976dcfc5119cf43b4824d2368b9f9a",
    ],
    [
      "409",
      join(GML_DATA, "409.gml"),
      "33d5d2958754c6daa1b309d161347eda10a997dbf29910d8bf9166650cd63709",
    ],
    [
      "158",
      join(GML_DATA, "158.gml"),
      "987ea02f5e3e43d892dd63ab41a6871f7f6a323aeb669316745e296280c90ce0",
    ],
    [
      "20312",
      join(GML_DATA, "20312.gml"),
      "7b9e306ac579fd8949faa0bfce3a723934cdd80f6993f3d5e3747d9c664426b0",
    ],
    [
      "19938",
      join(GML_DATA, "19938.gml"),
      "aeca4af16262f4667c630a68604e01141452686aa44cf24d4c2b17fa4d7a25ee",
    ],
    [
      "18476",
      join(GML_DATA, "18476.gml"),
      "908b6cfc9aef496dd5ab5c5540d80c6383ed6e92f86044574c996315381bc064",
    ],
  ])("%s matches its round-geometry pixel hash", async (_name, path, hash) => {
    const xml = readFileSync(path, "utf8");
    const context = new RenderContextTscanvas(1024, 768);
    renderGml(xml, context);
    const image = decodePng(new Uint8Array(await context.renderToArrayBuffer({ type: "png" })));
    expect(pixelHash(image)).toBe(hash);
  });
});

async function expectStrictStrokeAccuracy(path: string): Promise<void> {
  const xml = readFileSync(path, "utf8");
  const ours = new RenderContextTscanvas(1024, 768);
  renderGml(xml, ours);
  const oursImage = decodePng(new Uint8Array(await ours.renderToArrayBuffer({ type: "png" })));

  const skia = new RenderContextSkiaRaw(1024, 768);
  renderGml(xml, skia);
  const skiaImage = decodePng(new Uint8Array(await skia.renderToArrayBuffer({ type: "png" })));

  const nodeCanvas = ServerRenderContext.createRenderContext({
    type: "node-canvas",
    width: 1024,
    height: 768,
  });
  renderGml(xml, nodeCanvas);
  const nodeImage = decodePng(
    new Uint8Array(await nodeCanvas.renderToArrayBuffer({ type: "png" })),
  );

  const oursMetrics = compareImages(oursImage, skiaImage);
  const nodeMetrics = compareImages(nodeImage, skiaImage);
  expect(Math.abs(oursMetrics.inkMassBias)).toBeLessThanOrEqual(0.003);
  expect(oursMetrics.meanAbsoluteDifference).toBeLessThanOrEqual(
    nodeMetrics.meanAbsoluteDifference,
  );
  expect(oursMetrics.shareOver16).toBeLessThanOrEqual(nodeMetrics.shareOver16);
  expect(oursMetrics.maxAbsoluteDifference).toBeLessThanOrEqual(100);
}

function comparePngs(
  oursBytes: Buffer,
  skiaBytes: Buffer,
  name: string,
): {
  differentPixels: number;
  inkPixels: number;
  ratio: number;
  artifactDirectory?: string;
} {
  const ours = PNG.sync.read(oursBytes);
  const skia = PNG.sync.read(skiaBytes);
  const diff = new PNG({ width: skia.width, height: skia.height });
  const different = pixelmatch(skia.data, ours.data, diff.data, skia.width, skia.height, {
    threshold: 0.1,
  });
  let ink = 0;
  for (let index = 0; index < skia.data.length; index += 4) {
    const alpha = skia.data[index + 3]!;
    const luminance = (skia.data[index]! + skia.data[index + 1]! + skia.data[index + 2]!) / 3;
    if (alpha > 0 && luminance < 128) {
      ink += 1;
    }
  }

  const ratio = different / Math.max(1, ink);
  const directory = join(process.cwd(), "test-results/gmlrender", name);
  if (ratio > 0.01) {
    mkdirSync(directory, { recursive: true });
    writeFileSync(join(directory, "ours.png"), oursBytes);
    writeFileSync(join(directory, "skia.png"), skiaBytes);
    writeFileSync(join(directory, "diff.png"), PNG.sync.write(diff));
    return { differentPixels: different, inkPixels: ink, ratio, artifactDirectory: directory };
  }
  rmSync(directory, { recursive: true, force: true });
  return { differentPixels: different, inkPixels: ink, ratio };
}

function writeReviewImages(oursBytes: Buffer, skiaBytes: Buffer, name: string): void {
  const ours = PNG.sync.read(oursBytes);
  const skia = PNG.sync.read(skiaBytes);
  const diff = new PNG({ width: skia.width, height: skia.height });
  pixelmatch(skia.data, ours.data, diff.data, skia.width, skia.height, { threshold: 0.1 });

  const directory = join(process.cwd(), "test-results/review/gmlrender");
  mkdirSync(directory, { recursive: true });
  writeFileSync(join(directory, `${name}-tscanvas.png`), oursBytes);
  writeFileSync(join(directory, `${name}-skia.png`), skiaBytes);
  writeFileSync(join(directory, `${name}-diff.png`), PNG.sync.write(diff));
}
