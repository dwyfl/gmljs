import { describe, it, expect } from "vite-plus/test";
import { parseDecimal } from "../src/util/number.ts";
import { createGmlNodeFromXml } from "../src/gml/util/index.ts";
import { GMLNodeName } from "../src/gml/types.ts";

describe("parseDecimal()", () => {
  it.each([
    ["1", 1],
    [" -0.5 ", -0.5],
    [".5", 0.5],
    ["5.", 5],
    ["+2", 2],
    ["1e-3", 0.001],
    ["0.406848", 0.406848],
  ])("parses %j", (text, expected) => {
    expect(parseDecimal(text)).toBe(expected);
  });

  it.each(["", " ", "1.5abc", "abc", "0x10", "1e999", "Infinity", "NaN", "1,5", "2010-05-01", "."])(
    "rejects %j",
    (text) => {
      expect(parseDecimal(text)).toBeUndefined();
    },
  );
});

describe("numeric leaves", () => {
  const parse = (xml: string) => createGmlNodeFromXml(xml, { strict: true });

  it("rejects floats with trailing text", () => {
    expect(() => parse("<pt><x>1.5abc</x><y>1</y></pt>")).toThrow(/as float/);
  });

  it("accepts integer-valued decimals for integer tags", () => {
    const client = parse("<client><time>1928372722.0</time></client>");
    expect(client.getChildValue([GMLNodeName.CLIENT_TIME])).toBe(1928372722);
  });

  it("rejects fractional and non-numeric values for integer tags", () => {
    expect(() => parse("<client><time>1.5</time></client>")).toThrow(/as integer/);
    expect(() => parse("<client><time>2010-05-01</time></client>")).toThrow(/as integer/);
  });
});
