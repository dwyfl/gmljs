import { GMLNode } from "../../node.ts";
import type { GMLObjectRepresentation, GMLParsedNode } from "../../types.ts";
import { escapeXmlText } from "../../../util/xml.ts";

export class GMLLeafNode extends GMLNode {
  override init(data?: GMLParsedNode) {
    super.init(data);
    const { defaultValue } = this.definition;
    if (!data && defaultValue !== undefined) {
      this.setValue(typeof defaultValue === "function" ? defaultValue() : defaultValue);
    }
  }
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
