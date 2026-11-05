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

  it("creates documents from points with no options unchanged", () => {
    const strokes = [
      [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
      ],
    ];
    expect(GML.fromPoints(strokes).toString()).toBe(GML.fromPoints(strokes, {}).toString());
  });

  it("attaches a brush width to the first stroke", () => {
    const gml = GML.fromPoints([[{ x: 0, y: 0 }], [{ x: 1, y: 1 }]], { brush: { width: 4 } });
    const strokes = gml.getStrokes();
    expect(strokes[0]?.isDrawing()).toBe(true);
    expect(strokes[0]?.getBrush()?.getWidth()).toBe(4);
    expect(strokes[1]?.getBrush()).toBeUndefined();
  });

  it("attaches a brush color to the first stroke", () => {
    const gml = GML.fromPoints([[{ x: 0, y: 0 }]], {
      brush: { width: 2, color: [10, 20, 30, 128] },
    });
    expect(gml.getStroke(0, 0, 0)?.getBrush()?.getColor()).toStrictEqual([10, 20, 30, 128]);
  });

  it("overrides client name/version", () => {
    const gml = GML.fromPoints([[{ x: 0, y: 0 }]], {
      client: { name: "WritersBench", version: "1.0" },
    });
    expect(gml.getClient()?.toData()).toMatchObject({ name: "WritersBench", version: "1.0" });
  });

  it("keeps client defaults when client option is omitted", () => {
    const withBounds = GML.fromPoints([[{ x: 0, y: 0 }]], { screenBounds: { x: 1, y: 1 } });
    expect(withBounds.getClient()).toBeUndefined();
    expect(GML.fromPoints([[{ x: 0, y: 0 }]]).getClient()).toBeUndefined();
  });

  it("round-trips brush, client and screenBounds through toString/parse", () => {
    const gml = GML.fromPoints(
      [
        [
          { x: 0, y: 0 },
          { x: 1, y: 1 },
        ],
      ],
      {
        screenBounds: { x: 800, y: 600 },
        brush: { width: 6, color: [1, 2, 3, 4] },
        client: { name: "WritersBench", version: "1.0" },
      },
    );
    const reparsed = new GML(gml.toString());
    expect(reparsed.getSize()).toStrictEqual([800, 600]);
    expect(reparsed.getClient()?.toData()).toMatchObject({ name: "WritersBench", version: "1.0" });
    expect(reparsed.getStroke(0, 0, 0)?.getBrush()?.getWidth()).toBe(6);
    expect(reparsed.getStroke(0, 0, 0)?.getBrush()?.getColor()).toStrictEqual([1, 2, 3, 4]);
    expect(reparsed.toString()).toBe(gml.toString());
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
