import { describe, it, expect } from "vite-plus/test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createGmlNodeFromTagName, createGmlNodeFromXml } from "../src/gml/util/index.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const testXml = readFileSync(join(__dirname, "data/brush.xml"), "utf-8");

describe("GMLBrush", () => {
  it("creates a default GMLBrush node", () => {
    const gml = createGmlNodeFromTagName("brush").toString();
    expect(gml).toMatchSnapshot();
  });
  it("creates a GMLBrush node from spec XML", () => {
    const gml = createGmlNodeFromXml(testXml).toString();
    expect(gml).toMatchSnapshot();
  });
});
