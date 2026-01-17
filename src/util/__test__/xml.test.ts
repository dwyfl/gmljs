import { describe, it, type TestContext } from "node:test";
import { formatXmlTagStart, formatXmlTagEnd, parseXml } from "../xml.ts";

describe("formatXmlTagStart()", () => {
  it("should create xml tags without attributes", (t: TestContext) => {
    t.assert.strictEqual(formatXmlTagStart("test"), "<test>");
  });
  it("should create xml tags with one attibute", (t: TestContext) => {
    t.assert.strictEqual(
      formatXmlTagStart("test", { keke: "lele" }),
      `<test keke="lele">`
    );
  });
  it("should create xml tags with several attibutes", (t: TestContext) => {
    t.assert.strictEqual(
      formatXmlTagStart("test", { keke: "lele", asdf: "qwer" }),
      `<test keke="lele" asdf="qwer">`
    );
  });
});

describe("formatXmlTagEnd()", () => {
  it("should create xml end tags", (t: TestContext) => {
    t.assert.strictEqual(formatXmlTagEnd("test"), "</test>");
  });
});

describe("parseXml()", () => {
  it("parses XML with whitespace and empty nodes", (t: TestContext) => {
    const doc = parseXml("\n<root>\n  <child />\n</root>\n");
    t.assert.strictEqual(doc.documentElement?.tagName, "root");
    t.assert.strictEqual(doc.getElementsByTagName("child").length, 1);
  });

  it("throws on malformed XML", (t: TestContext) => {
    t.assert.throws(
      () => parseXml("<root><child></root>"),
      /Opening and ending tag mismatch: "child" != "root"/
    );
  });
});
