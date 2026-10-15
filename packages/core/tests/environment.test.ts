import { describe, it, expect } from "vite-plus/test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createGmlNodeFromTagName, createGmlNodeFromXml } from "../src/gml/util/index.ts";
import { GMLNodeName } from "../src/gml/types.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const testXml = readFileSync(join(__dirname, "data/environment.xml"), "utf-8");

describe("GMLEnvironment", () => {
  it("creates a default GMLEnvironment node", () => {
    const gml = createGmlNodeFromTagName(GMLNodeName.ENVIRONMENT).toString();
    expect(gml).toMatchSnapshot();
  });
  it("creates a GMLEnvironment node from spec XML", () => {
    const gml = createGmlNodeFromXml(testXml).toString();
    expect(gml).toMatchSnapshot();
  });
});
