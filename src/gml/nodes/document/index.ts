import { GMLNode } from "../../node.ts";
import { type GMLNodeDefinition, GMLNodeName } from "../../types.ts";
import { GMLRoot } from "../root/index.ts";

export class GMLDocument extends GMLNode {
  toString() {
    return this.getChild<GMLRoot>(GMLNodeName.ROOT)?.toString() ?? "";
  }
}

export const GMLDocumentDefinition: GMLNodeDefinition = {
  name: GMLNodeName.DOCUMENT,
  model: GMLDocument,
  attributes: [],
  children: [{ name: GMLNodeName.ROOT, initDefault: true }],
};

export default GMLDocumentDefinition;
