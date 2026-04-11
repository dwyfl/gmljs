import { GMLLeafNode } from "./index.ts";
import { type GMLParsedNode } from "../../types.ts";

export class GMLFloatNode extends GMLLeafNode {
  init(data?: GMLParsedNode) {
    this.value = 0.0;
    super.init(data);
  }
  parseValue(data: GMLParsedNode) {
    const value = data.textContent ?? "";
    const floatValue = parseFloat(value);
    if (isNaN(floatValue) || !Number.isFinite(floatValue)) {
      throw new Error(`Unable to parse value "${value}" as float.`);
    }
    this.value = floatValue;
  }
}
