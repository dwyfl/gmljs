import { describe, it, expect, vi } from "vite-plus/test";
import { GMLParseError } from "../src/errors.ts";
import {
  escapeXmlAttribute,
  escapeXmlText,
  formatXmlTagStart,
  formatXmlTagEnd,
  parseXml,
} from "../src/util/xml.ts";

describe("formatXmlTagStart()", () => {
  it("should create xml tags without attributes", () => {
    expect(formatXmlTagStart("test")).toBe("<test>");
  });
  it("should create xml tags with one attibute", () => {
    expect(formatXmlTagStart("test", { keke: "lele" })).toBe(`<test keke="lele">`);
  });
  it("escapes attribute values", () => {
    expect(formatXmlTagStart("test", { a: `1 "&" <2>` })).toBe(
      `<test a="1 &quot;&amp;&quot; &lt;2&gt;">`,
    );
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

  it("throws GMLParseError on malformed XML", () => {
    expect(() => parseXml("<root><child></root>")).toThrow(GMLParseError);
    expect(() => parseXml("")).toThrow(GMLParseError);
  });

  it("does not log parser errors to the console", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      expect(() => parseXml("<root><child></root>")).toThrow();
      parseXml("<root>a & b</root>");
      expect(error).not.toHaveBeenCalled();
      expect(warn).not.toHaveBeenCalled();
    } finally {
      error.mockRestore();
      warn.mockRestore();
    }
  });
});

describe("escapeXml*()", () => {
  it("escapes text content", () => {
    expect(escapeXmlText(`a & <b> "c"`)).toBe(`a &amp; &lt;b&gt; "c"`);
  });
  it("escapes attribute values", () => {
    expect(escapeXmlAttribute(`a & <b> "c"`)).toBe(`a &amp; &lt;b&gt; &quot;c&quot;`);
  });
});
