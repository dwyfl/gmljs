import { describe, it, type TestContext } from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createGmlNodeFromTagName, createGmlNodeFromXml } from "../../util";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const testXml = readFileSync(join(__dirname, "data/client.xml"), "utf-8");

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
