import {
  createGmlNode,
  createGmlNodeFromTagName,
  isGMLNodeName,
} from "../../util";
import { GMLNodeName, GMLNodeValue } from "../../types";
import { GMLNode } from "../..";
import { getGMLNodeDefinition } from "../../map";

export const createLeafNodeParentFromObject = (
  tagName: GMLNodeName,
  obj: Partial<Record<GMLNodeName, GMLNodeValue>>
): GMLLeafNodeParent => {
  const node = createGmlNodeFromTagName(tagName) as GMLLeafNodeParent;
  node.setValues(obj);
  return node;
};

export class GMLLeafNodeParent extends GMLNode {
  setValues(
    obj?: Partial<Record<GMLNodeName, GMLNodeValue>>,
    overwrite = true
  ) {
    if (!obj) {
      return;
    }
    Object.entries(obj)
      .filter((item): item is [GMLNodeName, GMLNodeValue] =>
        isGMLNodeName(item[0])
      )
      .forEach(([name, value]) => {
        const child = this.getChild(name);
        if (!child) {
          const childNode = this.getChildNodeDefinition(name);
          if (childNode) {
            const definition = getGMLNodeDefinition(name);
            const node = createGmlNode(definition);
            this.addChild(name, node);
            node.setValue(value);
          }
        } else if (overwrite) {
          child.setValue(value);
        }
      });
  }
  toObject() {
    return (<GMLNodeName[]>Object.keys(this.children)).reduce(
      (obj, tag) => ({
        ...obj,
        [tag]: this.getChild(tag)?.getValue(),
      }),
      {}
    );
  }
}
