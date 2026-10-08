// Imports a node module directly, without the package entry or gml/util,
// to make sure nodes don't depend on module-load side effects.
import { describe, it, expect } from "vite-plus/test";
import { createGmlNode } from "../src/gml/node.ts";
import { GMLStroke, GMLStrokeDefinition } from "../src/gml/nodes/stroke/index.ts";
import { parseXml } from "../src/util/xml.ts";

describe("standalone node modules", () => {
  it("creates and parses nodes without the registry", () => {
    const empty = createGmlNode(GMLStrokeDefinition);
    expect(empty).toBeInstanceOf(GMLStroke);

    const xml = parseXml("<stroke><pt><x>1</x><y>2</y><time>.5</time></pt></stroke>");
    const stroke = createGmlNode(
      GMLStrokeDefinition,
      xml.documentElement ?? undefined,
    ) as GMLStroke;
    expect(stroke.getPoint(0)?.getXYZ()).toStrictEqual([1, 2, 0]);
    expect(stroke.getPoint(0)?.getT()).toBe(0.5);
  });
});
