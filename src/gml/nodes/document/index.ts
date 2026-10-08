import { GMLNode } from "../../node.ts";
import { type GMLNodeDefinition, GMLNodeName } from "../../types.ts";

export class GMLDocument extends GMLNode {
  override toString() {
    return this.getChild(GMLNodeName.ROOT)?.toString() ?? "";
  }
}

export const GMLDocumentDefinition: GMLNodeDefinition = {
  name: GMLNodeName.DOCUMENT,
  model: GMLDocument,
  attributes: [],
  children: [{ name: GMLNodeName.ROOT, initDefault: true }],
};

export default GMLDocumentDefinition;
