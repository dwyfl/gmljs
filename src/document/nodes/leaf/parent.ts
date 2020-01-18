import { GMLNode } from '../../../gml';

export class GMLLeafNodeParent extends GMLNode {
  static createFromObject(obj) {
    const node = new this();
    node.init();
    node.setValues(obj);
    return node;
  }
  setValues(obj) {
    Object.keys(obj).forEach(key => {
      let child = this.getChild([key, 0]);
      if (!child) {
        const nodeDefinition = this.constructor.getChildNodeDefinition(key);
        if (nodeDefinition) {
          child = nodeDefinition.model.create();
          this.addChild(key, child);
        }
      }
      if (child) {
        child.setValue(obj[key]);
      }
    });
  }
  toObject() {
    return Object.keys(this.children).reduce((obj, tag) => {
      return {
        ...obj,
        [tag]: this.children[tag][0].toObject(),
      };
    }, {});
  }
}