import { describe, it, expect, vi } from "vite-plus/test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createGmlNodeFromTagName, createGmlNodeFromXml } from "../src/gml/util/index.ts";

vi.mock("../package.json", () => ({ default: { version: "0.0.0-test" } }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const testXml = readFileSync(join(__dirname, "data/client.xml"), "utf-8");

describe("GMLClient", () => {
  it("creates a default GMLClient node", () => {
    vi.useFakeTimers({ now: new Date(0) });
    try {
      const gml = createGmlNodeFromTagName("client").toString();
      expect(gml).toMatchSnapshot();
    } finally {
      vi.useRealTimers();
    }
  });
  it("creates a GMLClient node from spec XML", () => {
    const gml = createGmlNodeFromXml(testXml).toString();
    expect(gml).toMatchSnapshot();
  });
});
