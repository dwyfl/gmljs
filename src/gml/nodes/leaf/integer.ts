import { GMLParseError } from "../../../errors.ts";
import { GMLLeafNode } from "./index.ts";
import { type GMLParsedNode } from "../../types.ts";

export class GMLIntegerNode extends GMLLeafNode {
  override init(data?: GMLParsedNode) {
    this.value = 0;
    super.init(data);
  }
  override parseValue(data: GMLParsedNode) {
    const value = (data.textContent ?? "").trim();
    const intValue = parseInt(value, 10);
    if (!Number.isFinite(intValue)) {
      throw new GMLParseError(`Unable to parse value "${value}" as integer.`);
    }
    this.value = intValue;
  }
  getIntValue() {
    return this.value as number;
  }
}
