import { describe, it, expect } from "vite-plus/test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { GML } from "../src/index.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const gml001 = readFileSync(join(__dirname, "data/gml001.xml"), "utf-8");

const xml = `<gml spec="1.0">
  <tag>
    <header>
      <client>
        <name>Laser Tag</name><username>bob</username><time>1928372722</time>
        <location><lat>53.29292</lat><lon>-39.392922</lon></location>
      </client>
      <environment>
        <screenBounds><x>1024</x><y>768</y></screenBounds>
        <up><x>0</x><y>-1</y></up>
        <audio>track.mp3</audio>
      </environment>
    </header>
    <drawing>
      <stroke isDrawing="false">
        <brush><width>2</width><color><r>255</r><g>0</g><b>0</b></color><uniqueStyleID>arrows</uniqueStyleID></brush>
        <pt><x>0.1</x><y>0.2</y><t>0</t><pres>0.5</pres></pt>
        <pt><x>0.3</x><y>0.4</y><z>1</z><t>0.5</t></pt>
      </stroke>
      <stroke><pt><x>1</x><y>1</y></pt></stroke>
    </drawing>
  </tag>
  <tag><drawing><stroke><pt><x>2</x><y>2</y></pt></stroke></drawing></tag>
</gml>`;

describe("toData()", () => {
  it("returns the document as plain data", () => {
    expect(new GML(xml).toData()).toStrictEqual({
      spec: "1.0",
      tags: [
        {
          client: {
            name: "Laser Tag",
            username: "bob",
            time: 1928372722,
            location: { lat: 53.29292, lon: -39.392922 },
          },
          environment: {
            screenBounds: [1024, 768],
            up: [0, -1, 0],
            audio: "track.mp3",
          },
          drawings: [
            {
              strokes: [
                {
                  isDrawing: false,
                  brush: { width: 2, color: [255, 0, 0, 255], uniqueStyleId: "arrows" },
                  points: [
                    { x: 0.1, y: 0.2, z: 0, t: 0, pressure: 0.5 },
                    { x: 0.3, y: 0.4, z: 1, t: 0.5 },
                  ],
                },
                { isDrawing: true, points: [{ x: 1, y: 1, z: 0 }] },
              ],
            },
          ],
        },
        { drawings: [{ strokes: [{ isDrawing: true, points: [{ x: 2, y: 2, z: 0 }] }] }] },
      ],
    });
  });

  it("is JSON-serializable without undefined fields", () => {
    const data = new GML(gml001).toData();
    expect(JSON.parse(JSON.stringify(data))).toStrictEqual(data);
    expect(data.tags[0]?.drawings[0]?.strokes[0]?.points).toHaveLength(155);
  });

  it("returns no tags for an empty document root", () => {
    expect(new GML("<gml/>").toData()).toStrictEqual({ tags: [] });
  });
});

describe("strokes()", () => {
  it("iterates strokes across all tags and drawings", () => {
    const gml = new GML(xml);
    const strokes = [...gml.strokes()];
    expect(strokes).toHaveLength(3);
    expect(strokes[0]).toBe(gml.getStroke(0, 0, 0));
    expect(strokes[2]).toBe(gml.getStroke(1, 0, 0));
  });

  it("yields nothing for documents without strokes", () => {
    expect([...new GML().strokes()]).toStrictEqual([]);
  });
});
