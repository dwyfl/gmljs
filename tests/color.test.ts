import { describe, it, expect } from "vite-plus/test";
import { createGmlNodeFromTagName, createGmlNodeFromXml } from "../src/gml/util/index.ts";
import { GMLNodeName } from "../src/gml/types.ts";
import { GMLColor } from "../src/gml/nodes/point/color.ts";

describe("GMLColor", () => {
  it("defaults to opaque black", () => {
    const color = createGmlNodeFromTagName(GMLNodeName.COLOR);
    expect(color.getRGBA()).toStrictEqual([0, 0, 0, 255]);
  });

  it("parses rgb from XML and defaults a to 255", () => {
    const color = createGmlNodeFromXml("<color><r>255</r><g>128</g><b>0</b></color>") as GMLColor;
    expect(color.getRGBA()).toStrictEqual([255, 128, 0, 255]);
  });

  it("parses rgba from XML", () => {
    const color = createGmlNodeFromXml(
      "<color><r>255</r><g>128</g><b>0</b><a>51</a></color>",
    ) as GMLColor;
    expect(color.getRGBA()).toStrictEqual([255, 128, 0, 51]);
  });

  it("returns normalized 0–1 components", () => {
    const color = createGmlNodeFromXml(
      "<color><r>255</r><g>51</g><b>0</b><a>102</a></color>",
    ) as GMLColor;
    expect(color.getNormalizedRGBA()).toStrictEqual([1, 0.2, 0, 0.4]);
    const opaque = createGmlNodeFromXml("<color><r>0</r><g>0</g><b>0</b></color>") as GMLColor;
    expect(opaque.getNormalizedRGBA()).toStrictEqual([0, 0, 0, 1]);
  });

  it("returns undefined when a component is missing", () => {
    const color = createGmlNodeFromXml("<color><r>255</r><g>0</g><b>0</b></color>") as GMLColor;
    color.removeChild(GMLNodeName.COLOR_B);
    expect(color.getRGBA()).toBeUndefined();
    expect(color.getNormalizedRGBA()).toBeUndefined();
  });
});
