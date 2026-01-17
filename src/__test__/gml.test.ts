import { describe, it, type TestContext } from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { GML } from "..";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const example000 = readFileSync(
  join(__dirname, "data/example000.xml"),
  "utf-8"
);
const example001 = readFileSync(
  join(__dirname, "data/example001.xml"),
  "utf-8"
);

describe("GML", () => {
  it("creates an empty GML document", (t: TestContext) => {
    const gml = new GML().toString();
    t.assert.snapshot(gml);
  });

  it("parses a minimal GML document correctly", (t: TestContext) => {
    const gml = new GML(example000).toString();
    t.assert.snapshot(gml);
  });

  it("parses a basic GML document correctly", (t: TestContext) => {
    const gml = new GML(example001).toString();
    t.assert.snapshot(gml);
  });

  it("getTags() works", (t: TestContext) => {
    const items = new GML(example001).getTags();
    t.assert.ok(Array.isArray(items));
    t.assert.strictEqual(items.length, 1);
    t.assert.snapshot(items?.[0].toString());
  });

  it("getDrawings() works", (t: TestContext) => {
    const items = new GML(example001).getDrawings(0);
    t.assert.ok(Array.isArray(items));
    t.assert.strictEqual(items?.length, 1);
    t.assert.snapshot(items?.[0].toString());
  });

  it("getStrokes() works", (t: TestContext) => {
    const items = new GML(example001).getStrokes(0, 0);
    t.assert.ok(Array.isArray(items));
    t.assert.strictEqual(items?.length, 1);
    t.assert.snapshot(items?.[0].toString());
  });

  it("getPoints() works", (t: TestContext) => {
    const items = new GML(example001).getPoints(0, 0, 0);
    t.assert.ok(Array.isArray(items));
    t.assert.strictEqual(items?.length, 155);
    t.assert.snapshot(items?.map((item) => item.toString()).join(""));
  });

  it("getChildPath() works", (t: TestContext) => {
    const name = new GML(example001)
      ?.getRoot()
      ?.getChildPath(["tag", "header", "client", "name"]);
    t.assert.snapshot(name?.toString());
  });

  it("getTitle() read client values", (t: TestContext) => {
    const xml =
      '<gml spec="1.0"><tag><header><client><username>gmljs</username></client></header><drawing></drawing></tag></gml>';
    const gml = new GML(xml);
    t.assert.strictEqual(gml.getTitle(), "gmljs");
  });

  it("getTitle() returns undefined when missing", (t: TestContext) => {
    const gml = new GML();
    t.assert.strictEqual(gml.getTitle(), undefined);
  });
});
