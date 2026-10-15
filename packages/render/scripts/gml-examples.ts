import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { RenderContextGmljsCanvas } from "../src/server/index.ts";
import { GML_DATA, renderGml, RenderContextSkiaReference } from "../tests/helpers/gml-compare.ts";

const WIDTH = 1024;
const HEIGHT = 768;
const outputDirectory = join(process.cwd(), "test-results/review/gmljs-canvas");

rmSync(outputDirectory, { recursive: true, force: true });
mkdirSync(outputDirectory, { recursive: true });

const documents = readdirSync(GML_DATA)
  .filter((name) => name.endsWith(".xml"))
  .sort();

for (const document of documents) {
  const name = basename(document, ".xml");
  const xml = readFileSync(join(GML_DATA, document), "utf8");

  const ours = new RenderContextGmljsCanvas(WIDTH, HEIGHT);
  renderGml(xml, ours);
  const oursBytes = Buffer.from(await ours.renderToArrayBuffer({ type: "png" }));

  const skia = new RenderContextSkiaReference(WIDTH, HEIGHT);
  renderGml(xml, skia);
  const skiaBytes = Buffer.from(await skia.renderToArrayBuffer({ type: "png" }));

  const oursPng = PNG.sync.read(oursBytes);
  const skiaPng = PNG.sync.read(skiaBytes);
  const diff = new PNG({ width: WIDTH, height: HEIGHT });
  pixelmatch(skiaPng.data, oursPng.data, diff.data, WIDTH, HEIGHT, { threshold: 0.1 });

  writeFileSync(join(outputDirectory, `${name}-gmljs-canvas.png`), oursBytes);
  writeFileSync(join(outputDirectory, `${name}-skia.png`), skiaBytes);
  writeFileSync(join(outputDirectory, `${name}-diff.png`), PNG.sync.write(diff));
  console.log(`Rendered ${document}`);
}

console.log(`Wrote ${documents.length * 3} PNGs to ${outputDirectory}`);
