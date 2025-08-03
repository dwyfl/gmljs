import { describe, it, type TestContext } from "node:test";
import { readFileSync } from "node:fs";
import { GML } from "..";

const example000 = readFileSync("./data/example000.xml", "utf-8");
const example001 = readFileSync("./data/example001.xml", "utf-8");

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
    t.assert.isArray(items);
    t.assert.lengthOf(items, 1);
    t.assert.snapshot(items?.[0].toString());
  });

  it("getDrawings() works", (t: TestContext) => {
    const items = new GML(example001).getDrawings(0);
    t.assert.isArray(items);
    t.assert.lengthOf(items, 1);
    t.assert.snapshot(items?.[0].toString());
  });

  it("getStrokes() works", (t: TestContext) => {
    const items = new GML(example001).getStrokes(0, 0);
    t.assert.isArray(items);
    t.assert.lengthOf(items, 1);
    t.assert.snapshot(items?.[0].toString());
  });

  it("getPoints() works", (t: TestContext) => {
    const items = new GML(example001).getPoints(0, 0, 0);
    t.assert.isArray(items);
    t.assert.lengthOf(items, 155);
    t.assert.snapshot(items?.map((item) => item.toString()).join(""));
  });

  it("GMLNode::getChildPath() works", (t: TestContext) => {
    const name = new GML(example001)
      ?.getRoot()
      ?.getChildPath(["tag", "header", "client", "name"]);
    t.assert.snapshot(name?.toString());
  });
});
