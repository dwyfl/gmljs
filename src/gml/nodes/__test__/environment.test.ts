import { describe, it, type TestContext } from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createGmlNodeFromTagName, createGmlNodeFromXml } from "../../util";
import { GMLNodeName } from "../../types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const testXml = readFileSync(join(__dirname, "data/environment.xml"), "utf-8");

describe("GMLEnvironment", () => {
  it("creates a default GMLEnvironment node", (t: TestContext) => {
    const gml = createGmlNodeFromTagName(GMLNodeName.ENVIRONMENT).toString();
    t.assert.snapshot(gml);
  });
  it("creates a GMLEnvironment node from spec XML", (t: TestContext) => {
    const gml = createGmlNodeFromXml(testXml).toString();
    t.assert.snapshot(gml);
  });
});
