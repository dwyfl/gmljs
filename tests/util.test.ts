import { describe, it, expect } from "vite-plus/test";
import { createGmlNodeFromTagName, createGmlNodeFromXml } from "../src/gml/util/index.ts";
import { GMLNodeName } from "../src/gml/types.ts";

describe("gml util", () => {
  it("throws for unknown tag names", () => {
    expect(() => createGmlNodeFromTagName("not-a-tag" as GMLNodeName)).toThrow(/not-a-tag/);
  });

  it("throws for unknown XML root tags", () => {
    expect(() => createGmlNodeFromXml("<not-a-tag></not-a-tag>")).toThrow(/not-a-tag/);
  });
});
