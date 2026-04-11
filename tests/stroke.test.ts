import { describe, it, expect } from "vite-plus/test";
import { createGmlNodeFromTagName, createGmlNodeFromXml } from "../src/gml/util/index.ts";
import { GMLNodeName } from "../src/gml/types.ts";
import { GMLStroke } from "../src/gml/nodes/stroke/index.ts";

describe("GMLStroke", () => {
  it("defaults isDrawing to true", () => {
    const stroke = createGmlNodeFromTagName(GMLNodeName.STROKE) as GMLStroke;
    expect(stroke.isDrawing()).toBe(true);
  });

  it("parses isDrawing attribute", () => {
    const stroke = createGmlNodeFromXml(
      '<stroke isdrawing="false"><pt><x>0</x><y>0</y></pt></stroke>',
    ) as GMLStroke;
    expect(stroke.isDrawing()).toBe(false);
  });

  it("returns points and indexed points", () => {
    const stroke = createGmlNodeFromXml(
      "<stroke><pt><x>1</x><y>2</y></pt><pt><x>3</x><y>4</y></pt></stroke>",
    ) as GMLStroke;
    const points = stroke.getPoints();
    expect(Array.isArray(points)).toBeTruthy();
    expect(points?.length).toBe(2);
    expect(stroke.getPoint(1)?.getXYZ()).toStrictEqual([3, 4, 0]);
    expect(stroke.getPoint(2)).toBeUndefined();
  });
});
