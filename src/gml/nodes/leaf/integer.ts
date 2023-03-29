import { GMLLeafNode } from ".";
import { GMLParsedNode } from "../../types";

export class GMLIntegerNode extends GMLLeafNode {
  init(data?: GMLParsedNode) {
    this.value = 0;
    super.init(data);
  }
  parseValue(value: string) {
    const intValue = parseInt(value, 10);
    if (isNaN(intValue)) {
      throw new Error(`Unable to parse value "${value}" as integer.`);
    }
    this.value = intValue;
  }
}