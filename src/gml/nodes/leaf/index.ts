import { GMLNode } from "../../node.ts";

export class GMLLeafNode extends GMLNode {
  getTagContent() {
    return this.value.toString();
  }
}
