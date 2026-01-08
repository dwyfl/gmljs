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

  it.skip("getTags() works", (t: TestContext) => {
    const items = new GML(example001).getTags();
    t.assert.isArray(items);
    t.assert.lengthOf(items, 1);
    t.assert.snapshot(items?.[0].toString());
  });

  it.skip("getDrawings() works", (t: TestContext) => {
    const items = new GML(example001).getDrawings(0);
    t.assert.isArray(items);
    t.assert.lengthOf(items, 1);
    t.assert.snapshot(items?.[0].toString());
  });

  it.skip("getStrokes() works", (t: TestContext) => {
    const items = new GML(example001).getStrokes(0, 0);
    t.assert.isArray(items);
    t.assert.lengthOf(items, 1);
    t.assert.snapshot(items?.[0].toString());
  });

  it.skip("getPoints() works", (t: TestContext) => {
    const items = new GML(example001).getPoints(0, 0, 0);
    t.assert.isArray(items);
    t.assert.lengthOf(items, 155);
    t.assert.snapshot(items?.map((item) => item.toString()).join(""));
  });

  it.skip("GMLNode::getChildPath() works", (t: TestContext) => {
    const name = new GML(example001)
      ?.getRoot()
      ?.getChildPath(["tag", "header", "client", "name"]);
    t.assert.snapshot(name?.toString());
  });
});
