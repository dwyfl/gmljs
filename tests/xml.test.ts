import { describe, it, expect } from "vite-plus/test";
import { formatXmlTagStart, formatXmlTagEnd, parseXml } from "../src/util/xml.ts";

describe("formatXmlTagStart()", () => {
  it("should create xml tags without attributes", () => {
    expect(formatXmlTagStart("test")).toBe("<test>");
  });
  it("should create xml tags with one attibute", () => {
    expect(formatXmlTagStart("test", { keke: "lele" })).toBe(`<test keke="lele">`);
  });
  it("should create xml tags with several attibutes", () => {
    expect(formatXmlTagStart("test", { keke: "lele", asdf: "qwer" })).toBe(
      `<test keke="lele" asdf="qwer">`,
    );
  });
});

describe("formatXmlTagEnd()", () => {
  it("should create xml end tags", () => {
    expect(formatXmlTagEnd("test")).toBe("</test>");
  });
});

describe("parseXml()", () => {
  it("parses XML with whitespace and empty nodes", () => {
    const doc = parseXml("\n<root>\n  <child />\n</root>\n");
    expect(doc.documentElement?.tagName).toBe("root");
    expect(doc.getElementsByTagName("child").length).toBe(1);
  });

  it("throws on malformed XML", () => {
    expect(() => parseXml("<root><child></root>")).toThrow(
      /Opening and ending tag mismatch: "child" != "root"/,
    );
  });
});
