import { GMLLeafNodeParent, GMLLeafNode, GMLFloatNode } from './leafnode';

export default class GMLPoint extends GMLLeafNodeParent {
  static getSupportedChildNodes() {
    return [
      GMLPointX.getNodeDefinition({required: true}),
      GMLPointY.getNodeDefinition({required: true}),
      GMLPointZ.getNodeDefinition(),
      GMLPointT.getNodeDefinition(),
      GMLPointTime.getNodeDefinition(),
      GMLPointPressure.getNodeDefinition(),
      GMLPointRotation.getNodeDefinition(),
      GMLPointUnit.getNodeDefinition(),
      GMLPointDirection.getNodeDefinition(),
    ];
  }
  static getTagName() {
    return 'pt';
  }
  postInit() {
    if (
      this.children.hasOwnProperty('time') &&
      this.children.time.length &&
      !this.children.hasOwnProperty('t')
    ) {
      this.children.t = this.children.time;
    }
    delete this.children.time;
  }
}

class GMLPointX extends GMLFloatNode {
  static getTagName() {
    return 'x';
  }
}
class GMLPointY extends GMLFloatNode {
  static getTagName() {
    return 'y';
  }
}
class GMLPointZ extends GMLFloatNode {
  static getTagName() {
    return 'z';
  }
}
class GMLPointT extends GMLFloatNode {
  static getTagName() {
    return 't';
  }
}
class GMLPointTime extends GMLFloatNode {
  static getTagName() {
    return 'time';
  }
}
class GMLPointPressure extends GMLFloatNode {
  static getTagName() {
    return 'pres';
  }
}
class GMLPointRotation extends GMLFloatNode {
  static getTagName() {
    return 'rot';
  }
}
class GMLPointUnit extends GMLLeafNode {
  static getTagName() {
    return 'unit';
  }
}
class GMLPointDirection extends GMLLeafNodeParent {
  static getSupportedChildNodes() {
    return [
      GMLPointX.getNodeDefintion({required: true}),
      GMLPointY.getNodeDefintion({required: true}),
      GMLPointZ.getNodeDefintion(),
    ];
  }
  static getTagName() {
    return 'dir';
  }
}