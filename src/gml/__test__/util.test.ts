import { describe, it, type TestContext } from "node:test";
import { createGmlNodeFromTagName, createGmlNodeFromXml } from "../util";
import { GMLNodeName } from "../types";

describe("gml util", () => {
  it("throws for unknown tag names", (t: TestContext) => {
    t.assert.throws(
      () => createGmlNodeFromTagName("not-a-tag" as GMLNodeName),
      /not-a-tag/
    );
  });

  it("throws for unknown XML root tags", (t: TestContext) => {
    t.assert.throws(
      () => createGmlNodeFromXml("<not-a-tag></not-a-tag>"),
      /not-a-tag/
    );
  });
});
