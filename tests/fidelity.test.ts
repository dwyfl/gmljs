import { describe, it, expect } from "vite-plus/test";
import { createGmlNodeFromXml, parseGML } from "../src/gml/util/index.ts";
import { GMLNodeName } from "../src/gml/types.ts";
import { GMLUnknownNode } from "../src/gml/unknown.ts";

describe("round-trip fidelity", () => {
  it("keeps unknown elements verbatim and in place", () => {
    const xml = '<pt><x>1</x><custom a="1">keep <b>me</b> &amp; this</custom><y>2</y></pt>';
    const point = createGmlNodeFromXml(xml);
    expect(point.toString()).toBe(
      '<pt><x>1</x><custom a="1">keep <b>me</b> &amp; this</custom><y>2</y></pt>',
    );
    const [unknown] = point.getUnknownChildren();
    expect(unknown).toBeInstanceOf(GMLUnknownNode);
    expect(unknown?.name).toBe("custom");
  });

  it("keeps known elements in unexpected places", () => {
    const doc = parseGML("<gml><tag><stroke><pt><x>1</x><y>1</y></pt></stroke></tag></gml>");
    expect(doc.toString()).toBe(
      '<gml spec="1.0"><tag><stroke><pt><x>1</x><y>1</y></pt></stroke></tag></gml>',
    );
  });

  it("keeps sibling order", () => {
    const stroke = createGmlNodeFromXml(
      "<stroke><pt><x>1</x><y>1</y></pt><brush><width>2</width></brush><pt><x>2</x><y>2</y></pt></stroke>",
    );
    expect(stroke.toString()).toBe(
      '<stroke isDrawing="true"><pt><x>1</x><y>1</y></pt><brush><width>2</width></brush><pt><x>2</x><y>2</y></pt></stroke>',
    );
    expect(
      stroke
        .getChildNodes()
        .map((node) => (node instanceof GMLUnknownNode ? node.name : node.definition.name)),
    ).toStrictEqual(["pt", "brush", "pt"]);
  });

  it("keeps unknown attributes, including namespace declarations", () => {
    const doc = parseGML(
      '<gml spec="1.0" xmlns:foo="urn:foo" foo:bar="a &amp; b"><tag><drawing/></tag></gml>',
    );
    expect(doc.toString()).toBe(
      '<gml spec="1.0" xmlns:foo="urn:foo" foo:bar="a &amp; b"><tag><drawing></drawing></tag></gml>',
    );
  });

  it("keeps document order consistent when removing children", () => {
    const stroke = createGmlNodeFromXml(
      "<stroke><pt><x>1</x><y>1</y></pt><custom/><pt><x>2</x><y>2</y></pt></stroke>",
    );
    stroke.removeChild(GMLNodeName.POINT, 0);
    expect(stroke.toString()).toBe(
      '<stroke isDrawing="true"><custom/><pt><x>2</x><y>2</y></pt></stroke>',
    );
    stroke.removeChild(GMLNodeName.POINT);
    expect(stroke.toString()).toBe('<stroke isDrawing="true"><custom/></stroke>');
  });

  it("flattens markup inside leaf values to text", () => {
    const client = createGmlNodeFromXml("<client><name>a <b>bold</b> name</name></client>");
    expect(client.toString()).toBe("<client><name>a bold name</name></client>");
  });
});
