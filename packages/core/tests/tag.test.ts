import { describe, it, expect } from "vite-plus/test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createGmlNodeFromTagName, createGmlNodeFromXml } from "../src/gml/util/index.ts";
import { GMLNodeName } from "../src/gml/types.ts";
import { GMLTag } from "../src/gml/nodes/tag/index.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const test001 = readFileSync(join(__dirname, "data/tag.xml"), "utf-8");

describe("GMLTag", () => {
  it("creates a default GMLTag node", () => {
    const gml = createGmlNodeFromTagName("tag").toString();
    expect(gml).toMatchSnapshot();
  });
  it("creates a GMLTag node from spec XML", () => {
    const gml = createGmlNodeFromXml(test001).toString();
    expect(gml).toMatchSnapshot();
  });

  it("getClientName() falls back to unknown", () => {
    const tag = createGmlNodeFromTagName(GMLNodeName.TAG) as GMLTag;
    expect(tag.getClientName()).toBe("unknown");
    const named = createGmlNodeFromXml(
      "<tag><header><client><name>seen</name></client></header></tag>",
    ) as GMLTag;
    expect(named.getClientName()).toBe("seen");
  });

  it("getEnvironment() also finds an environment directly under <tag>", () => {
    const tag = createGmlNodeFromXml(
      "<tag><environment><screenBounds><x>1</x><y>2</y></screenBounds></environment></tag>",
    ) as GMLTag;
    expect(tag.getEnvironment()?.getScreenBounds()).toStrictEqual([1, 2]);
  });
});
