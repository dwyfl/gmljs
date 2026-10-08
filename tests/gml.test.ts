import { describe, it, expect } from "vite-plus/test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { GML, GMLParseError } from "../src/index.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const gml000 = readFileSync(join(__dirname, "data/gml000.xml"), "utf-8");
const gml001 = readFileSync(join(__dirname, "data/gml001.xml"), "utf-8");

describe("GML", () => {
  it("creates an empty GML document", () => {
    const gml = new GML().toString();
    expect(gml).toMatchSnapshot();
  });

  it("parses a minimal GML document correctly", () => {
    const gml = new GML(gml000).toString();
    expect(gml).toMatchSnapshot();
  });

  it("parses a basic GML document correctly", () => {
    const gml = new GML(gml001).toString();
    expect(gml).toMatchSnapshot();
  });

  it("getTags() works", () => {
    const items = new GML(gml001).getTags();
    expect(Array.isArray(items)).toBeTruthy();
    expect(items.length).toBe(1);
    expect(items[0]?.toString()).toMatchSnapshot();
  });

  it("getDrawings() works", () => {
    const items = new GML(gml001).getDrawings(0);
    expect(Array.isArray(items)).toBeTruthy();
    expect(items?.length).toBe(1);
    expect(items[0]?.toString()).toMatchSnapshot();
  });

  it("getStrokes() works", () => {
    const items = new GML(gml001).getStrokes(0, 0);
    expect(Array.isArray(items)).toBeTruthy();
    expect(items?.length).toBe(1);
    expect(items[0]?.toString()).toMatchSnapshot();
  });

  it("getPoints() works", () => {
    const items = new GML(gml001).getPoints(0, 0, 0);
    expect(Array.isArray(items)).toBeTruthy();
    expect(items?.length).toBe(155);
    expect(items?.map(String).join("")).toMatchSnapshot();
  });

  it("getChildPath() works", () => {
    const name = new GML(gml001)?.getRoot()?.getChildPath(["tag", "header", "client", "name"]);
    expect(name?.toString()).toMatchSnapshot();
  });

  it("getTitle() read client values", () => {
    const xml1 =
      '<gml spec="1.0"><tag><header><client><username>gmljs</username></client></header><drawing></drawing></tag></gml>';
    const gml1 = new GML(xml1);
    expect(gml1.getTitle()).toBe("gmljs");
    const xml2 =
      '<gml spec="1.0"><tag><header><client><name>gmljs</name></client></header><drawing></drawing></tag></gml>';
    const gml2 = new GML(xml2);
    expect(gml2.getTitle()).toBe("gmljs");
  });

  it("getTitle() returns undefined when missing", () => {
    const gml = new GML();
    expect(gml.getTitle()).toBeUndefined();
  });

  it("getTitle() prefers username over the client application name", () => {
    const gml = new GML(
      "<gml><tag><header><client><name>Laser Tag</name><username>bob</username></client></header><drawing/></tag></gml>",
    );
    expect(gml.getTitle()).toBe("bob");
  });

  it("getClient() returns the client node", () => {
    const gml = new GML(gml001);
    expect(gml.getClient()?.getChildValue(["name"])).toBe("seen");
    expect(new GML().getClient()).toBeUndefined();
  });

  it("parses <time> by parent: integer under <client>, float under <pt>", () => {
    const gml = new GML(
      "<gml><tag><header><client><time>1928372722</time></client></header><drawing><stroke><pt><x>0.0</x><y>0.0</y><time>1.12342</time></pt></stroke></drawing></tag></gml>",
    );
    expect(gml.getClient()?.getChildValue(["time"])).toBe(1928372722);
    const point = gml.getPoint(0, 0, 0, 0);
    expect(point?.getT()).toBe(1.12342);
    expect(point?.getChild("time")).toBeUndefined();
  });

  it("getSize() returns the screen bounds", () => {
    const gml = new GML(
      "<gml><tag><header><environment><screenBounds><x>640</x><y>480</y></screenBounds></environment></header><drawing/></tag></gml>",
    );
    expect(gml.getSize()).toStrictEqual([640, 480]);
    expect(new GML(gml001).getSize()).toBeUndefined();
  });

  it("collection getters return empty arrays when the parent is missing", () => {
    const gml = new GML();
    expect(gml.getDrawings(5)).toStrictEqual([]);
    expect(gml.getStrokes(0, 5)).toStrictEqual([]);
    expect(gml.getPoints(0, 0, 0)).toStrictEqual([]);
    expect(gml.getPoint(0, 0, 0, 0)).toBeUndefined();
  });

  it("rejects input that is not a GML document", () => {
    expect(() => new GML("<foo/>")).toThrow(GMLParseError);
    expect(() => new GML("")).toThrow(GMLParseError);
  });

  it("round-trips its own output", () => {
    const once = new GML(gml001).toString();
    expect(new GML(once).toString()).toBe(once);
  });

  it("exposes parse warnings and supports strict mode", () => {
    const xml = "<gml><tag><drawing><stroke><pt><x>1</x></pt></stroke></drawing></tag></gml>";
    const gml = new GML(xml);
    expect(gml.warnings).toHaveLength(1);
    expect(gml.getPoints(0, 0, 0)).toStrictEqual([]);
    expect(() => new GML(xml, { strict: true })).toThrow(GMLParseError);
  });

  it("exposes the document read-only", () => {
    const gml = new GML();
    // @ts-expect-error doc has no setter
    expect(() => (gml.doc = new GML().doc)).toThrow(TypeError);
  });
});
