import { GMLLeafNodeParent, GMLFloatNode } from './leafnode';

export default class GMLColor extends GMLLeafNodeParent {
  static getSupportedChildNodes() {
    return [
      GMLColorR.getNodeDefinition({required: true}),
      GMLColorG.getNodeDefinition({required: true}),
      GMLColorB.getNodeDefinition({required: true}),
      GMLColorA.getNodeDefinition(),
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