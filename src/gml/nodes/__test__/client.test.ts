import { describe, it, type TestContext } from "node:test";
import { readFileSync } from "node:fs";
import { createGmlNodeFromTagName, createGmlNodeFromXml } from "../../util";

const testXml = readFileSync("./data/client.xml", "utf-8");

describe("GMLClient", () => {
  it("creates a default GMLClient node", (t: TestContext) => {
    t.mock.timers.enable({
      apis: ["Date"],
      now: new Date(0),
    });
    try {
      const gml = createGmlNodeFromTagName("brush").toString();
      t.assert.snapshot(gml);
    } finally {
      t.mock.timers.reset();
    }
  });
  it("creates a GMLClient node from spec XML", (t: TestContext) => {
    const gml = createGmlNodeFromXml(testXml).toString();
    t.assert.snapshot(gml);
  });
});
