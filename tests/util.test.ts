import { describe, it, expect } from "vite-plus/test";
import { GMLParseError } from "../src/errors.ts";
import {
  createGMLDocumentFromPointArrays,
  createGmlNodeFromTagName,
  createGmlNodeFromXml,
  parseGML,
} from "../src/gml/util/index.ts";
import { GMLNodeName } from "../src/gml/types.ts";

describe("gml util", () => {
  it("throws for unknown tag names", () => {
    expect(() => createGmlNodeFromTagName("not-a-tag" as GMLNodeName)).toThrow(/not-a-tag/);
  });

  it("throws for unknown XML root tags", () => {
    expect(() => createGmlNodeFromXml("<not-a-tag></not-a-tag>")).toThrow(GMLParseError);
    expect(() => createGmlNodeFromXml("<not-a-tag></not-a-tag>")).toThrow(/not-a-tag/);
    expect(() => createGmlNodeFromXml("<_></_>")).toThrow(GMLParseError);
  });

  it("matches the XML root tag case-insensitively", () => {
    expect(createGmlNodeFromXml("<Brush><Width>2</Width></Brush>").toString()).toBe(
      "<brush><width>2</width></brush>",
    );
  });
});

describe("parseGML()", () => {
  it("rejects documents without a <gml> root", () => {
    expect(() => parseGML("<foo/>")).toThrow(GMLParseError);
    expect(() => parseGML("<foo/>")).toThrow(/<foo>/);
  });

  it("accepts an uppercase <GML> root", () => {
    expect(parseGML("<GML><tag><drawing/></tag></GML>").toString()).toBe(
      '<gml spec="1.0"><tag><drawing></drawing></tag></gml>',
    );
  });

  it("reports the path of the invalid element", () => {
    const xml =
      "<gml><tag><drawing><stroke><pt><x>0</x><y>0</y></pt><pt><x>oops</x><y>0</y></pt></stroke></drawing></tag></gml>";
    let error: unknown;
    try {
      parseGML(xml);
    } catch (e) {
      error = e;
    }
    expect(error).toBeInstanceOf(GMLParseError);
    const { path, reason } = error as GMLParseError;
    expect(reason).toBe('Unable to parse value "oops" as float.');
    expect(path).toStrictEqual(["gml[0]", "tag[0]", "drawing[0]", "stroke[0]", "pt[1]", "x[0]"]);
  });

  it("reports the path of a missing required child", () => {
    expect(() =>
      parseGML("<gml><tag><drawing><stroke><pt><x>0</x></pt></stroke></drawing></tag></gml>"),
    ).toThrow(
      /requires a "y" child node\. \(at gml\[0\]\/tag\[0\]\/drawing\[0\]\/stroke\[0\]\/pt\[0\]\)/,
    );
  });
});

describe("createGMLDocumentFromPointArrays()", () => {
  it("creates one stroke per point array", () => {
    const doc = createGMLDocumentFromPointArrays([
      [
        { x: 0, y: 0 },
        { x: 1, y: 2, t: 0.5 },
      ],
      [{ x: 3, y: 4, z: 5 }],
    ]);
    const strokes = doc
      .getChildPath([GMLNodeName.ROOT, GMLNodeName.TAG])
      ?.getDrawing()
      ?.getStrokes();
    expect(strokes?.map((stroke) => stroke.getPoints().map((pt) => pt.getXYZ()))).toStrictEqual([
      [
        [0, 0, 0],
        [1, 2, 0],
      ],
      [[3, 4, 5]],
    ]);
    expect(strokes?.[0]?.getPoint(1)?.getT()).toBe(0.5);
  });

  it("sets screen bounds in the header environment", () => {
    const doc = createGMLDocumentFromPointArrays([[{ x: 0, y: 0 }]], {
      screenBounds: { x: 640, y: 480 },
    });
    const tag = doc.getChildPath([GMLNodeName.ROOT, GMLNodeName.TAG]);
    expect(tag?.getEnvironment()?.getScreenBounds()).toStrictEqual([640, 480]);
    expect(doc.toString()).toMatch(
      /^<gml spec="1.0"><tag><header><environment>.*<\/header><drawing>/,
    );
  });
});
