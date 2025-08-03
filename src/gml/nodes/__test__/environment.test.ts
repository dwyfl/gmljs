import { describe, it, type TestContext } from "node:test";
import { readFileSync } from "node:fs";
import { createGmlNodeFromTagName, createGmlNodeFromXml } from "../../util";

const testXml = readFileSync("./data/environment.xml", "utf-8");

describe("GMLEnvironment", () => {
  it("creates a default GMLEnvironment node", (t: TestContext) => {
    const gml = createGmlNodeFromTagName("environment").toString();
    t.assert.snapshot(gml);
  });
  it("creates a GMLEnvironment node from spec XML", (t: TestContext) => {
    const gml = createGmlNodeFromXml(testXml).toString();
    t.assert.snapshot(gml);
  });
});
