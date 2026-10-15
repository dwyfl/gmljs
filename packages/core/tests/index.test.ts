import { describe, it, expect } from "vite-plus/test";
import * as gmljs from "../src/index.ts";
import GML from "../src/index.ts";
import { GMLNodeName } from "../src/gml/types.ts";
import { GMLPoint } from "../src/gml/nodes/point/index.ts";

describe("public entry", () => {
  it("exports the documented API", () => {
    // The node classes are exported as types only.
    expect(Object.keys(gmljs).sort()).toStrictEqual(["GML", "GMLParseError", "default"]);
  });

  it("creates documents from points", () => {
    const gml = GML.fromPoints(
      [
        [
          { x: 0, y: 0 },
          { x: 1, y: 0.5, t: 0.1 },
        ],
        [{ x: 0.2, y: 0.2 }],
      ],
      {
        screenBounds: { x: 640, y: 480 },
      },
    );
    expect(
      gml.toData().tags[0]?.drawings[0]?.strokes.map((stroke) => stroke.points.length),
    ).toStrictEqual([2, 1]);
    expect(gml.getSize()).toStrictEqual([640, 480]);
    expect(new GML(gml.toString()).toString()).toBe(gml.toString());
  });

  it("runs the README example", () => {
    const gml = new GML(`
<gml spec='1.0'>
  <tag>
    <drawing>
      <stroke>
        <pt><x>0.0</x><y>0.0</y></pt>
        <pt><x>100.0</x><y>0.0</y></pt>
        <pt><x>100.0</x><y>100.0</y></pt>
      </stroke>
    </drawing>
  </tag>
</gml>`);
    const calls: string[] = [];
    for (const stroke of gml.getStrokes(0, 0)) {
      const [first, ...rest] = stroke.getPoints();
      if (!first) continue;
      const [x, y] = first.getXYZ();
      calls.push(`moveTo ${x} ${y}`);
      for (const pt of rest) {
        const [x, y] = pt.getXYZ();
        calls.push(`lineTo ${x} ${y}`);
      }
    }
    expect(calls).toStrictEqual(["moveTo 0 0", "lineTo 100 0", "lineTo 100 100"]);
  });

  it("infers node types from tag names", () => {
    const point = new GML(
      "<gml><tag><drawing><stroke><pt><x>1</x><y>2</y></pt></stroke></drawing></tag></gml>",
    )
      .getRoot()
      ?.getChildPath([GMLNodeName.TAG, GMLNodeName.DRAWING, GMLNodeName.STROKE, GMLNodeName.POINT]);
    expect(point).toBeInstanceOf(GMLPoint);
    // Compiles only if the path resolves to GMLPoint.
    expect(point?.getXYZ()).toStrictEqual([1, 2, 0]);
  });
});
