import { describe, it, expect } from "vite-plus/test";
import { createGmlNodeFromTagName, createGmlNodeFromXml } from "../src/gml/util/index.ts";
import { GMLNodeName } from "../src/gml/types.ts";
import { GMLPoint } from "../src/gml/nodes/point/index.ts";

describe("GMLPoint", () => {
  it("defaults xyz to zero and leaves t undefined", () => {
    const point = createGmlNodeFromTagName(GMLNodeName.POINT) as GMLPoint;
    expect(point.getXYZ()).toStrictEqual([0, 0, 0]);
    expect(point.getT()).toBeUndefined();
  });

  it("converts <time> to <t>", () => {
    const point = createGmlNodeFromXml("<pt><x>1</x><y>2</y><time>3.5</time></pt>") as GMLPoint;
    expect(point.getT()).toBe(3.5);
    expect(point.getChild(GMLNodeName.POINT_TIME)).toBeUndefined();
    expect(point.getChild(GMLNodeName.POINT_T)?.getValue()).toBe(3.5);
  });

  it("parses xyz values from XML", () => {
    const point = createGmlNodeFromXml("<pt><x>1</x><y>2</y><z>3</z><t>0.4</t></pt>") as GMLPoint;
    expect(point.getXYZ()).toStrictEqual([1, 2, 3]);
    expect(point.getT()).toBe(0.4);
  });

  it("setValues respects overwrite=false for existing children", () => {
    const point = createGmlNodeFromTagName(GMLNodeName.POINT) as GMLPoint;
    point.setValues({ x: 10, t: 1.25 }, false);
    expect(point.getChild(GMLNodeName.POINT_X)?.getValue()).toBe(0);
    expect(point.getT()).toBe(1.25);
  });

  it("throws on invalid float values", () => {
    expect(() => createGmlNodeFromXml("<pt><x> </x><y>1</y></pt>")).toThrow(
      /Unable to parse value/,
    );
  });
});
