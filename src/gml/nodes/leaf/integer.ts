import { GMLParseError } from "../../../errors.ts";
import { GMLLeafNode } from "./index.ts";
import type { GMLNodeValue, GMLParsedNode } from "../../types.ts";

export class GMLIntegerNode extends GMLLeafNode {
  override value: GMLNodeValue = 0;

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
