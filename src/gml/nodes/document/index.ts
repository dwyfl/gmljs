import { GMLNode } from "../..";
import { GMLNodeDefinition, GMLNodeName } from "../../types";
import { GMLRoot } from "../root";

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
