import { describe, it, expect } from "vite-plus/test";
import { createGmlNodeFromTagName, createGmlNodeFromXml } from "../src/gml/util/index.ts";
import { GMLNodeName } from "../src/gml/types.ts";
import { GMLColor } from "../src/gml/nodes/point/color.ts";

describe("GMLColor", () => {
  it("defaults rgb to zero and a to one", () => {
    const color = createGmlNodeFromTagName(GMLNodeName.COLOR) as GMLColor;
    expect(color.getRGBA()).toStrictEqual([0, 0, 0, 1]);
  });

  it("parses rgb from XML and defaults a to one", () => {
    const color = createGmlNodeFromXml("<color><r>0.2</r><g>0.4</g><b>0.6</b></color>") as GMLColor;
    expect(color.getRGBA()).toStrictEqual([0.2, 0.4, 0.6, 1]);
  });

  it("parses rgba from XML", () => {
    const color = createGmlNodeFromXml(
      "<color><r>1</r><g>0.5</g><b>0</b><a>0.8</a></color>",
    ) as GMLColor;
    expect(color.getRGBA()).toStrictEqual([1, 0.5, 0, 0.8]);
  });
});
