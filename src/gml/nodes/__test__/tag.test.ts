import { describe, it, type TestContext } from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createGmlNodeFromTagName, createGmlNodeFromXml } from "../../util";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const test001 = readFileSync(join(__dirname, "data/tag001.xml"), "utf-8");
// @TODO
// const test002 = readFileSync(join(__dirname, "data/tag002.xml"), "utf-8");
// const test003 = readFileSync(join(__dirname, "data/tag003.xml"), "utf-8");
// const test004 = readFileSync(join(__dirname, "data/tag004.xml"), "utf-8");
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
