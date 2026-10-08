import { describe, it, expect } from "vite-plus/test";
import { createGmlNodeFromTagName, createGmlNodeFromXml } from "../src/gml/util/index.ts";
import { GMLNodeName } from "../src/gml/types.ts";

const strokeXml =
  "<stroke><pt><x>1</x><y>1</y></pt><pt><x>2</x><y>2</y></pt><pt><x>3</x><y>3</y></pt></stroke>";
const xOf = (stroke: ReturnType<typeof createGmlNodeFromXml>) =>
  stroke.getChildren(GMLNodeName.POINT)?.map((pt) => pt.getXYZ()[0]);

describe("GMLNode", () => {
  describe("removeChild()", () => {
    it("removes only the child at index 0", () => {
      const stroke = createGmlNodeFromXml(strokeXml);
      stroke.removeChild(GMLNodeName.POINT, 0);
      expect(xOf(stroke)).toStrictEqual([2, 3]);
    });

    it("removes the child at a later index", () => {
      const stroke = createGmlNodeFromXml(strokeXml);
      stroke.removeChild(GMLNodeName.POINT, 2);
      expect(xOf(stroke)).toStrictEqual([1, 2]);
    });

    it("ignores out-of-range indices", () => {
      const stroke = createGmlNodeFromXml(strokeXml);
      stroke.removeChild(GMLNodeName.POINT, -1);
      stroke.removeChild(GMLNodeName.POINT, 3);
      expect(xOf(stroke)).toStrictEqual([1, 2, 3]);
    });

    it("removes all children without an index", () => {
      const stroke = createGmlNodeFromXml(strokeXml);
      stroke.removeChild(GMLNodeName.POINT);
      expect(stroke.hasChild(GMLNodeName.POINT)).toBe(false);
    });
  });

  describe("toObject()", () => {
    it("keeps leaf values and nests children in arrays", () => {
      const client = createGmlNodeFromXml(
        "<client><name>seen</name><location><lat>1.5</lat><lon>2</lon></location></client>",
      );
      expect(client.toObject()).toStrictEqual({
        name: ["seen"],
        location: [{ lat: ["1.5"], lon: ["2"] }],
      });
    });

    it("represents points with numeric values", () => {
      const point = createGmlNodeFromTagName(GMLNodeName.POINT);
      expect(point.toObject()).toStrictEqual({ x: [0], y: [0], z: [0] });
    });
  });

  describe("leaf values", () => {
    it("keeps the whole trimmed text of string leaves", () => {
      const client = createGmlNodeFromXml(
        "<client><name>\n  seen\n</name><keywords>a,\nb</keywords></client>",
      );
      expect(client.getChildValue([GMLNodeName.CLIENT_NAME])).toBe("seen");
      expect(client.getChildValue([GMLNodeName.CLIENT_KEYWORDS])).toBe("a,\nb");
    });

    it("container nodes have no value", () => {
      const client = createGmlNodeFromXml("<client><name>seen</name></client>");
      expect(client.getValue()).toBe("");
    });
  });

  describe("toString()", () => {
    it("escapes text values so the output parses back to the same data", () => {
      const client = createGmlNodeFromXml(
        "<client><username>a &amp; &lt;b&gt;</username></client>",
      );
      const xml = client.toString();
      expect(xml).toBe("<client><username>a &amp; &lt;b&gt;</username></client>");
      expect(createGmlNodeFromXml(xml).getChildValue([GMLNodeName.CLIENT_USERNAME])).toBe(
        "a & <b>",
      );
    });

    it("escapes attribute values", () => {
      const root = createGmlNodeFromXml(`<gml spec='1.0 "x" &amp;'><tag><drawing/></tag></gml>`);
      expect(root.getTagStart()).toBe('<gml spec="1.0 &quot;x&quot; &amp;">');
    });

    it("writes tag and attribute names in spec casing", () => {
      const xml =
        "<environment><screenBounds><x>1</x><y>2</y></screenBounds><realScale><x>1</x><y>1</y></realScale></environment>";
      expect(createGmlNodeFromXml(xml).toString()).toContain("<screenBounds>");
      expect(createGmlNodeFromXml(xml).toString()).toContain("</realScale>");
      expect(createGmlNodeFromTagName(GMLNodeName.STROKE).toString()).toBe(
        '<stroke isDrawing="true"></stroke>',
      );
    });
  });

  it("exposes children read-only (type-level)", () => {
    const stroke = createGmlNodeFromXml(strokeXml);
    // Never called: each line must fail to compile.
    const mutations = () => {
      // @ts-expect-error children is a getter
      stroke.children = {};
      // @ts-expect-error the record is readonly
      stroke.children.pt = [];
      // @ts-expect-error the arrays are readonly
      stroke.children.pt?.push(createGmlNodeFromTagName(GMLNodeName.POINT));
      // @ts-expect-error getChildren() returns a readonly array
      stroke.getChildren(GMLNodeName.POINT)?.pop();
      // @ts-expect-error definition is readonly
      stroke.definition = stroke.definition;
    };
    expect(typeof mutations).toBe("function");
    expect(stroke.children.pt).toHaveLength(3);
  });
});
