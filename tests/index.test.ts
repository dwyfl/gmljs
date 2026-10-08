import { describe, it, expect } from "vite-plus/test";
import * as gmljs from "../src/index.ts";
import GML, { GMLNodeName, GMLPoint } from "../src/index.ts";

describe("public entry", () => {
  it("exports the documented API", () => {
    expect(Object.keys(gmljs).sort()).toStrictEqual(
      [
        "GML",
        "GML3DPoint",
        "GMLBrush",
        "GMLClient",
        "GMLColor",
        "GMLDocument",
        "GMLDrawing",
        "GMLEnvironment",
        "GMLFloatNode",
        "GMLHeader",
        "GMLIntegerNode",
        "GMLLeafNode",
        "GMLLeafNodeParent",
        "GMLNode",
        "GMLNodeAttribute",
        "GMLNodeName",
        "GMLParseError",
        "GMLPoint",
        "GMLRoot",
        "GMLStroke",
        "GMLTag",
        "createGMLDocumentFromPointArrays",
        "createGmlNode",
        "createGmlNodeFromTagName",
        "createGmlNodeFromXml",
        "default",
        "isGMLNodeAttribute",
        "isGMLNodeName",
        "parseGML",
      ].sort(),
    );
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
