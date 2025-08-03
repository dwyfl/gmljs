import { describe, it, type TestContext } from "node:test";
import { readFileSync } from "node:fs";
import { createGmlNodeFromTagName, createGmlNodeFromXml } from "../../util";

const testXml = readFileSync("./data/brush.xml", "utf-8");

describe("GMLBrush", () => {
  it("creates a default GMLBrush node", (t: TestContext) => {
    const gml = createGmlNodeFromTagName("brush").toString();
    t.assert.snapshot(gml);
  });
  it("creates a GMLBrush node from spec XML", (t: TestContext) => {
    const gml = createGmlNodeFromXml(testXml).toString();
    t.assert.snapshot(gml);
  });
});
