import { describe, it, expect } from "vite-plus/test";
import { createGmlNodeFromTagName } from "../src/gml/util/index.ts";
import { GMLNodeAttribute, GMLNodeName } from "../src/gml/types.ts";
import { GMLDocument } from "../src/gml/nodes/document/index.ts";
import { GMLRoot } from "../src/gml/nodes/root/index.ts";

describe("GMLDocument/GMLRoot", () => {
  it("document string delegates to root", () => {
    const doc = createGmlNodeFromTagName(GMLNodeName.DOCUMENT) as GMLDocument;
    const root = doc.getChild<GMLRoot>(GMLNodeName.ROOT);
    expect(root).toBeTruthy();
    expect(doc.toString()).toBe(root?.toString());
  });

  it("root defaults spec attribute and tag child", () => {
    const root = createGmlNodeFromTagName(GMLNodeName.ROOT) as GMLRoot;
    expect(root.getAttribute(GMLNodeAttribute.SPEC)).toBe("1.0");
    expect(Array.isArray(root.getTags())).toBeTruthy();
    expect(root.getTags()?.length).toBe(1);
    expect(root.getTag()).toBeTruthy();
  });
});
