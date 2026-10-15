import { mkdirSync, existsSync, unlinkSync, rmdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import type { CanvasRenderingContext2D as SkiaContext } from "skia-canvas";
import { Canvas, type CanvasContext2D } from "../src/node.ts";
import { createSkiaCanvas } from "./skia.ts";

export interface ReferenceScene {
  readonly name: string;
  readonly width: number;
  readonly height: number;
  readonly drawOurs: (context: CanvasContext2D) => void;
  readonly drawSkia: (context: SkiaContext) => void;
}

export interface ReferenceResult {
  readonly differentPixels: number;
  readonly inkPixels: number;
  readonly ratio: number;
  readonly artifactDirectory?: string;
}

const ARTIFACT_ROOT = join(process.cwd(), "test-results");

export async function compareScene(
  scene: ReferenceScene,
  maximumRatio = 0.01,
): Promise<ReferenceResult> {
  const ours = new Canvas(scene.width, scene.height);
  scene.drawOurs(ours.getContext("2d"));
  const oursBytes = await ours.encode();

  const skia = createSkiaCanvas(scene.width, scene.height);
  scene.drawSkia(skia.getContext("2d"));
  const skiaBytes = skia.toBufferSync("png");

  const oursPng = PNG.sync.read(Buffer.from(oursBytes));
  const skiaPng = PNG.sync.read(skiaBytes);
  const diff = new PNG({ width: scene.width, height: scene.height });
  const differentPixels = pixelmatch(
    skiaPng.data,
    oursPng.data,
    diff.data,
    scene.width,
    scene.height,
    { threshold: 0.1 },
  );

  let inkPixels = 0;
  for (let i = 3; i < skiaPng.data.length; i += 4) {
    if (skiaPng.data[i]! > 0) {
      inkPixels += 1;
    }
  }
  const ratio = differentPixels / Math.max(1, inkPixels);
  const directory = join(ARTIFACT_ROOT, scene.name);
  if (ratio > maximumRatio) {
    mkdirSync(directory, { recursive: true });
    writeFileSync(join(directory, "ours.png"), oursBytes);
    writeFileSync(join(directory, "skia.png"), skiaBytes);
    writeFileSync(join(directory, "diff.png"), PNG.sync.write(diff));
    return { differentPixels, inkPixels, ratio, artifactDirectory: directory };
  }

  removePriorArtifacts(directory);
  return { differentPixels, inkPixels, ratio };
}

function removePriorArtifacts(directory: string): void {
  if (!existsSync(directory)) {
    return;
  }
  for (const name of ["ours.png", "skia.png", "diff.png"]) {
    const file = join(directory, name);
    if (existsSync(file)) {
      unlinkSync(file);
    }
  }
  try {
    rmdirSync(directory);
  } catch {
    // Preserve the directory if it contains anything other than our known artifacts.
  }
}
