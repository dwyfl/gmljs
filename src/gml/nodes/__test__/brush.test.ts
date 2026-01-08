import { describe, it, type TestContext } from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createGmlNodeFromTagName, createGmlNodeFromXml } from "../../util";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const testXml = readFileSync(join(__dirname, "data/brush.xml"), "utf-8");

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
