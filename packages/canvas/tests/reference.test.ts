import { describe, expect, test } from "vite-plus/test";
import { compareScene } from "./reference.ts";
import { referenceScenes } from "./reference-scenes.ts";

describe("Skia reference images", () => {
  test.each(referenceScenes)("$name differs by less than 1% of ink pixels", async (scene) => {
    const result = await compareScene(scene);
    expect(result.ratio, result.artifactDirectory).toBeLessThanOrEqual(0.01);
  });
});
