import { GMLNode, getGMLNodeDeps } from "../../node.ts";
import { GMLNodeName, type GMLNodeValue } from "../../types.ts";

export class GMLLeafNodeParent extends GMLNode {
  setValues(obj?: Partial<Record<GMLNodeName, GMLNodeValue>>, overwrite = true) {
    if (!obj) {
      return;
    }
    const { isGMLNodeName, getGMLNodeDefinition, createGmlNode } = getGMLNodeDeps();
    Object.entries(obj)
      .filter((item): item is [GMLNodeName, GMLNodeValue] => isGMLNodeName(item[0]))
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
      {},
    );
  }
}
