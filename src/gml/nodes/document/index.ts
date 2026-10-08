import type { GMLParseError } from "../../../errors.ts";
import { GMLNode } from "../../node.ts";
import { type GMLNodeDefinition, GMLNodeName } from "../../types.ts";
import { GMLRootDefinition } from "../root/index.ts";

export class GMLDocument extends GMLNode {
  /** Invalid elements that were kept as GMLUnknownNode while parsing. */
  warnings: GMLParseError[] = [];

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
