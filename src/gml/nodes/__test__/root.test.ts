import { describe, it, type TestContext } from "node:test";
import { createGmlNodeFromTagName } from "../../util";
import { GMLNodeAttribute, GMLNodeName } from "../../types";
import { GMLDocument } from "../document";
import { GMLRoot } from "../root";

describe("GMLDocument/GMLRoot", () => {
  it("document string delegates to root", (t: TestContext) => {
    const doc = createGmlNodeFromTagName(GMLNodeName.DOCUMENT) as GMLDocument;
    const root = doc.getChild<GMLRoot>(GMLNodeName.ROOT);
    t.assert.ok(root);
    t.assert.strictEqual(doc.toString(), root?.toString());
  });

  it("root defaults spec attribute and tag child", (t: TestContext) => {
    const root = createGmlNodeFromTagName(GMLNodeName.ROOT) as GMLRoot;
    t.assert.strictEqual(root.getAttribute(GMLNodeAttribute.SPEC), "1.0");
    t.assert.ok(Array.isArray(root.getTags()));
    t.assert.strictEqual(root.getTags()?.length, 1);
    t.assert.ok(root.getTag());
  });
});
