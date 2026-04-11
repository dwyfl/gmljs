import { describe, it, expect } from "vite-plus/test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { GML } from "../src/index.ts";

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
    expect(items?.[0].toString()).toMatchSnapshot();
  });

  it("getDrawings() works", () => {
    const items = new GML(gml001).getDrawings(0);
    expect(Array.isArray(items)).toBeTruthy();
    expect(items?.length).toBe(1);
    expect(items?.[0].toString()).toMatchSnapshot();
  });

  it("getStrokes() works", () => {
    const items = new GML(gml001).getStrokes(0, 0);
    expect(Array.isArray(items)).toBeTruthy();
    expect(items?.length).toBe(1);
    expect(items?.[0].toString()).toMatchSnapshot();
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
    const xml =
      '<gml spec="1.0"><tag><header><client><username>gmljs</username></client></header><drawing></drawing></tag></gml>';
    const gml = new GML(xml);
    expect(gml.getTitle()).toBe("gmljs");
  });

  it("getTitle() returns undefined when missing", () => {
    const gml = new GML();
    expect(gml.getTitle()).toBeUndefined();
  });
});
