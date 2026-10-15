import { GMLNode } from "../../node.ts";
import {
  type GMLNodeName,
  type GMLNodeValue,
  type GMLParseContext,
  type GMLParsedNode,
  isGMLNodeName,
} from "../../types.ts";

export class GMLLeafNodeParent extends GMLNode {
  override init(data?: GMLParsedNode, context?: GMLParseContext) {
    super.init(data, context);
    if (!data) {
      this.setValues(this.definition.defaultChildValues);
    }
  }

  setValues(obj?: Partial<Record<GMLNodeName, GMLNodeValue>>, overwrite = true) {
    if (!obj) {
      return;
    }
    for (const [name, value] of Object.entries(obj)) {
      if (value === undefined || !isGMLNodeName(name)) {
        continue;
      }
      const child = this.getChild(name);
      if (child) {
        if (overwrite) {
          child.setValue(value);
        }
        continue;
      }
      const node = this.createChildNode(name);
      if (node) {
        node.setValue(value);
        this.addChild(name, node);
      }
    }
  }
}
