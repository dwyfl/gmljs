import { GMLNode } from "../../node.ts";
import type { GMLObjectRepresentation, GMLParseContext, GMLParsedNode } from "../../types.ts";
import { escapeXmlText } from "../../../util/xml.ts";

export class GMLLeafNode extends GMLNode {
  override init(data?: GMLParsedNode, context?: GMLParseContext) {
    super.init(data, context);
    const { defaultValue } = this.definition;
    if (!data && defaultValue !== undefined) {
      this.setValue(typeof defaultValue === "function" ? defaultValue() : defaultValue);
    }
  }
  /** Markup inside a leaf is flattened into its text value. */
  override parseChildNodes(_data: GMLParsedNode) {}
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
