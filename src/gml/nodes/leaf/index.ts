import { GMLNode } from "../../node.ts";
import type { GMLObjectRepresentation, GMLParsedNode } from "../../types.ts";
import { escapeXmlText } from "../../../util/xml.ts";

export class GMLLeafNode extends GMLNode {
  override parseValue(data: GMLParsedNode) {
    this.value = (data.textContent ?? "").trim();
  }
  override getTagContent() {
    return escapeXmlText(String(this.value));
  }
  override toObject(): GMLObjectRepresentation {
    return this.value;
  }
}
