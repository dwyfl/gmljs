import { GMLLeafNode } from ".";
import { GMLParsedNode } from "../../types";

export class GMLFloatNode extends GMLLeafNode {
  init(data?: GMLParsedNode) {
    this.value = 0.0;
    super.init(data);
  }
  parseValue(value: string) {
    const floatValue = parseFloat(value);
    if (isNaN(floatValue) || !Number.isFinite(floatValue)) {
      throw new Error(`Unable to parse value "${value}" as float.`);
    }
    this.value = floatValue;
  }
}