import { describe, it, expect } from "vite-plus/test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createGmlNodeFromTagName, createGmlNodeFromXml } from "../src/gml/util/index.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const test001 = readFileSync(join(__dirname, "data/tag.xml"), "utf-8");

describe("GMLTag", () => {
  it("creates a default GMLTag node", () => {
    const gml = createGmlNodeFromTagName("tag").toString();
    expect(gml).toMatchSnapshot();
  });
  it("creates a GMLTag node from spec XML", () => {
    const gml = createGmlNodeFromXml(test001).toString();
    expect(gml).toMatchSnapshot();
  });
});
