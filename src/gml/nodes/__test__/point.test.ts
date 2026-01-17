import { describe, it, type TestContext } from "node:test";
import { createGmlNodeFromTagName, createGmlNodeFromXml } from "../../util";
import { GMLNodeName } from "../../types";
import { GMLPoint } from "../point";

describe("GMLPoint", () => {
  it("defaults xyz to zero and leaves t undefined", (t: TestContext) => {
    const point = createGmlNodeFromTagName(GMLNodeName.POINT) as GMLPoint;
    t.assert.deepStrictEqual(point.getXYZ(), [0, 0, 0]);
    t.assert.strictEqual(point.getT(), undefined);
  });

  it("converts <time> to <t>", (t: TestContext) => {
    const point = createGmlNodeFromXml(
      "<pt><x>1</x><y>2</y><time>3.5</time></pt>"
    ) as GMLPoint;
    t.assert.strictEqual(point.getT(), 3.5);
    t.assert.strictEqual(point.getChild(GMLNodeName.POINT_TIME), undefined);
    t.assert.strictEqual(point.getChild(GMLNodeName.POINT_T)?.getValue(), 3.5);
  });

  it("parses xyz values from XML", (t: TestContext) => {
    const point = createGmlNodeFromXml(
      "<pt><x>1</x><y>2</y><z>3</z><t>0.4</t></pt>"
    ) as GMLPoint;
    t.assert.deepStrictEqual(point.getXYZ(), [1, 2, 3]);
    t.assert.strictEqual(point.getT(), 0.4);
  });

  it("setValues respects overwrite=false for existing children", (t: TestContext) => {
    const point = createGmlNodeFromTagName(GMLNodeName.POINT) as GMLPoint;
    point.setValues({ x: 10, t: 1.25 }, false);
    t.assert.strictEqual(point.getChild(GMLNodeName.POINT_X)?.getValue(), 0);
    t.assert.strictEqual(point.getT(), 1.25);
  });

  it("throws on invalid float values", (t: TestContext) => {
    t.assert.throws(
      () => createGmlNodeFromXml("<pt><x> </x><y>1</y></pt>"),
      /Unable to parse value/
    );
  });
});
