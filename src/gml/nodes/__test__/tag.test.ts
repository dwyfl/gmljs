import { describe, it, type TestContext } from "node:test";
import { readFileSync } from "node:fs";
import { createGmlNodeFromTagName, createGmlNodeFromXml } from "../../util";

const test001 = readFileSync("./data/tag001.xml", "utf-8");
// @TODO
// const test002 = readFileSync("./data/tag002.xml", "utf-8");
// const test003 = readFileSync("./data/tag003.xml", "utf-8");
// const test004 = readFileSync("./data/tag004.xml", "utf-8");

describe("GMLTag", () => {
  it("creates a default GMLTag node", (t: TestContext) => {
    const gml = createGmlNodeFromTagName("tag").toString();
    t.assert.snapshot(gml);
  });
  it("creates a GMLTag node from spec XML", (t: TestContext) => {
    const gml = createGmlNodeFromXml(test001).toString();
    t.assert.snapshot(gml);
  });
});
