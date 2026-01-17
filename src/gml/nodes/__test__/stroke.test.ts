import { describe, it, type TestContext } from "node:test";
import { createGmlNodeFromTagName, createGmlNodeFromXml } from "../../util";
import { GMLNodeName } from "../../types";
import { GMLStroke } from "../stroke";

describe("GMLStroke", () => {
  it("defaults isDrawing to true", (t: TestContext) => {
    const stroke = createGmlNodeFromTagName(GMLNodeName.STROKE) as GMLStroke;
    t.assert.strictEqual(stroke.isDrawing(), true);
  });

  it("parses isDrawing attribute", (t: TestContext) => {
    const stroke = createGmlNodeFromXml(
      "<stroke isdrawing=\"false\"><pt><x>0</x><y>0</y></pt></stroke>"
    ) as GMLStroke;
    t.assert.strictEqual(stroke.isDrawing(), false);
  });

  it("returns points and indexed points", (t: TestContext) => {
    const stroke = createGmlNodeFromXml(
      "<stroke><pt><x>1</x><y>2</y></pt><pt><x>3</x><y>4</y></pt></stroke>"
    ) as GMLStroke;
    const points = stroke.getPoints();
    t.assert.ok(Array.isArray(points));
    t.assert.strictEqual(points?.length, 2);
    t.assert.deepStrictEqual(stroke.getPoint(1)?.getXYZ(), [3, 4, 0]);
    t.assert.strictEqual(stroke.getPoint(2), undefined);
  });
});
