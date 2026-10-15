import { compareScene } from "../tests/reference.ts";
import { referenceScenes } from "../tests/reference-scenes.ts";

console.log("Skia comparison gallery · pixelmatch threshold 0.1");
console.log("| scene | different | reference ink | mismatch |");
console.log("|---|---:|---:|---:|");
for (const scene of referenceScenes) {
  const result = await compareScene(scene);
  console.log(
    `| ${scene.name} | ${result.differentPixels} | ${result.inkPixels} | ${(result.ratio * 100).toFixed(3)}% |`,
  );
}
