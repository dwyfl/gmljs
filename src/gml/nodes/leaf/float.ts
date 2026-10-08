import { GMLParseError } from "../../../errors.ts";
import { parseDecimal } from "../../../util/number.ts";
import { GMLLeafNode } from "./index.ts";
import type { GMLNodeValue, GMLParsedNode } from "../../types.ts";

export class GMLFloatNode extends GMLLeafNode {
  override value: GMLNodeValue = 0;

  override parseValue(data: GMLParsedNode) {
    const value = (data.textContent ?? "").trim();
    const floatValue = parseDecimal(value);
    if (floatValue === undefined) {
      throw new GMLParseError(`Unable to parse value "${value}" as float.`);
    }
    this.value = floatValue;
  }
  getFloatValue() {
    return this.value as number;
  }
}
