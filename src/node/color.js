import { GMLLeafNodeParent, GMLFloatNode } from './leafnode';

export default class GMLColor extends GMLLeafNodeParent {
  static getSupportedChildNodes() {
    return [
      GMLColorR.getNodeDefintion({required: true}),
      GMLColorG.getNodeDefintion({required: true}),
      GMLColorB.getNodeDefintion({required: true}),
      GMLColorA.getNodeDefintion(),
    ];
  }
  static getTagName() {
    return 'color';
  }
}

class GMLColorR extends GMLFloatNode {
  static getTagName() {
    return 'r';
  }
}
class GMLColorG extends GMLFloatNode {
  static getTagName() {
    return 'g';
  }
}
class GMLColorB extends GMLFloatNode {
  static getTagName() {
    return 'b';
  }
}
class GMLColorA extends GMLFloatNode {
  static getTagName() {
    return 'a';
  }
}