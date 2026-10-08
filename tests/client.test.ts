import { describe, it, expect, vi } from "vite-plus/test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createGmlNodeFromTagName, createGmlNodeFromXml } from "../src/gml/util/index.ts";
import { GMLNodeName } from "../src/gml/types.ts";
import { GMLTime } from "../src/gml/nodes/client/settings.ts";

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
  it("parses <time> as an integer unix timestamp", () => {
    const client = createGmlNodeFromXml("<client><time>1928372722</time></client>");
    const time = client.getChild(GMLNodeName.CLIENT_TIME);
    expect(time).toBeInstanceOf(GMLTime);
    expect(time?.getValue()).toBe(1928372722);
    expect(client.toString()).toContain("<time>1928372722</time>");
  });
});
