// @vitest-environment jsdom
// Runs the parser on the browser backend (native DOMParser/XMLSerializer),
// as used by the `browser` build, to keep both backends consistent.
import { describe, it, expect, vi } from "vite-plus/test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { GML, GMLParseError, createGmlNodeFromXml } from "../src/index.ts";

vi.mock("../src/util/xml-backend.ts", () => import("../src/util/xml-backend.browser.ts"));

const __dirname = dirname(fileURLToPath(import.meta.url));
const gml001 = readFileSync(join(__dirname, "data/gml001.xml"), "utf-8");

describe("browser XML backend", () => {
  it("uses the native DOMParser", () => {
    const parse = vi.spyOn(globalThis.DOMParser.prototype, "parseFromString");
    try {
      new GML("<gml><tag><drawing/></tag></gml>");
      expect(parse).toHaveBeenCalled();
    } finally {
      parse.mockRestore();
    }
  });

  it("parses gml001.xml like the xmldom backend", () => {
    const gml = new GML(gml001);
    expect(gml.warnings).toStrictEqual([]);
    expect(gml.getTitle()).toBe("seen");
    const points = gml.getPoints(0, 0, 0);
    expect(points).toHaveLength(155);
    expect(points[0]?.values).toStrictEqual({ x: 0.406848, y: 0.303721, z: 0, t: 0 });
    const once = gml.toString();
    expect(new GML(once).toString()).toBe(once);
  });

  it("keeps unknown elements and attributes verbatim", () => {
    const point = createGmlNodeFromXml(
      '<pt><x>1</x><custom a="1">keep <b>me</b> &amp; this</custom><y>2</y></pt>',
    );
    expect(point.toString()).toBe(
      '<pt><x>1</x><custom a="1">keep <b>me</b> &amp; this</custom><y>2</y></pt>',
    );
    const gml = new GML(
      '<gml spec="1.0" xmlns:foo="urn:foo" foo:bar="a &amp; b"><tag><drawing/></tag></gml>',
    );
    expect(gml.toString()).toBe(
      '<gml spec="1.0" xmlns:foo="urn:foo" foo:bar="a &amp; b"><tag><drawing></drawing></tag></gml>',
    );
  });

  it("reports invalid elements as warnings with paths", () => {
    const gml = new GML(
      "<gml><tag><drawing><stroke><pt><x>1</x></pt></stroke></drawing></tag></gml>",
    );
    expect(gml.warnings.map((warning) => warning.path.join("/"))).toStrictEqual([
      "gml[0]/tag[0]/drawing[0]/stroke[0]/pt[0]",
    ]);
  });

  it.each([
    ["", "empty input"],
    ["<gml><tag></gml>", "mismatched tags"],
    ["<gml spec=1.0></gml>", "unquoted attribute"],
    ["<gml>&nbsp;</gml>", "unknown entity"],
    ["text<gml/>", "text outside the root"],
  ])("throws GMLParseError for %j (%s)", (xml) => {
    expect(() => new GML(xml)).toThrow(GMLParseError);
  });
});
