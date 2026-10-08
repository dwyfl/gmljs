import { GMLNode } from "../../node.ts";
import { type GMLNodeDefinition, GMLNodeName } from "../../types.ts";
import { GMLRootDefinition } from "../root/index.ts";

export class GMLDocument extends GMLNode {
  override toString() {
    return this.getChild(GMLNodeName.ROOT)?.toString() ?? "";
  }
}

export const GMLDocumentDefinition: GMLNodeDefinition<GMLDocument> = {
  name: GMLNodeName.DOCUMENT,
  model: GMLDocument,
  attributes: [],
  children: [{ definition: GMLRootDefinition, initDefault: true }],
};

export default GMLDocumentDefinition;
