import { createGmlNodeFromTagName, isGMLNodeName } from '../../util';
import { GMLNodeName, GMLNodeValue } from '../../types';
import { GMLNode } from '../..';

export const createLeafNodeParentFromObject = (
  tagName: GMLNodeName,
  obj: Partial<Record<GMLNodeName, GMLNodeValue>>
): GMLLeafNodeParent => {
  const node = createGmlNodeFromTagName(tagName) as GMLLeafNodeParent;
  node.setValues(obj);
  return node;
}

export class GMLLeafNodeParent extends GMLNode {
  setValues(obj: Partial<Record<GMLNodeName, GMLNodeValue>>) {
    const supportedChildren = this.definition.children.map(
      item => isGMLNodeName(item) ? item : item.name
    );
    supportedChildren
      .filter(name => obj[name] !== undefined)
      .forEach(name => {
        const value = obj[name];
        const child = this.getChild(name);
        if (!child) {
          const childNode = this.getChildNodeDefinition(name);
          if (childNode) {
            this.addChild(name, createGmlNodeFromTagName(name));
          }
        }
        if (child && value) {
          child.setValue(value);
        }
      });
  }
  toObject() {
    return (<GMLNodeName[]>Object.keys(this.children)).reduce((obj, tag) => ({
        ...obj,
        [tag]: this.getChild(tag)?.getValue(),
      }),
      {}
    );
  }
}