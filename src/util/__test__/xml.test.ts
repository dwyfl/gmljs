import { describe, it, type TestContext } from "node:test";
import { formatXmlTagStart, formatXmlTagEnd } from "../xml.ts";

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
