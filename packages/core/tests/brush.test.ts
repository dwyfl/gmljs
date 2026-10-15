import { describe, it, expect } from "vite-plus/test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createGmlNodeFromTagName, createGmlNodeFromXml } from "../src/gml/util/index.ts";
import { GMLNodeName } from "../src/gml/types.ts";
import { GMLBrush } from "../src/gml/nodes/brush/index.ts";

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

  it("returns undefined for width and color when absent", () => {
    const brush = createGmlNodeFromTagName(GMLNodeName.BRUSH) as GMLBrush;
    expect(brush.getWidth()).toBeUndefined();
    expect(brush.getColor()).toBeUndefined();
  });

  it("parses width from XML", () => {
    const brush = createGmlNodeFromXml("<brush><width>2.5</width></brush>") as GMLBrush;
    expect(brush.getWidth()).toBe(2.5);
  });

  it("parses color from XML", () => {
    const brush = createGmlNodeFromXml(
      "<brush><color><r>255</r><g>128</g><b>0</b></color></brush>",
    ) as GMLBrush;
    expect(brush.getColor()).toStrictEqual([255, 128, 0, 255]);
  });

  it("parses drip settings from XML", () => {
    const brush = createGmlNodeFromXml(
      "<brush><dripamnt>0.3</dripamnt><dripspeed>1.5</dripspeed><dripvecrelativetoup><x>0</x><y>1</y></dripvecrelativetoup></brush>",
    ) as GMLBrush;
    const drip = brush.getDrip();
    expect(drip.dripAmount).toBe(0.3);
    expect(drip.dripSpeed).toBe(1.5);
    expect(drip.dripVecUp).toStrictEqual([0, 1, 0]);
  });

  it("returns undefined drip fields when absent", () => {
    const brush = createGmlNodeFromTagName(GMLNodeName.BRUSH) as GMLBrush;
    const drip = brush.getDrip();
    expect(drip.dripAmount).toBeUndefined();
    expect(drip.dripSpeed).toBeUndefined();
    expect(drip.dripVecUp).toBeUndefined();
  });
});
