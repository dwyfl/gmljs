import { GMLLeafNodeParent, GMLLeafNode, GMLFloatNode } from './leafnode';

export default class GMLPoint extends GMLLeafNodeParent {
  static getSupportedChildNodes() {
    return [
      GMLPointX.getNodeDefinition({required: true, initDefault: true}),
      GMLPointY.getNodeDefinition({required: true, initDefault: true}),
      GMLPointZ.getNodeDefinition({initDefault: true}),
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
    if (this.children.hasOwnProperty('time')) {
      if (this.children.time.length && !this.children.hasOwnProperty('t')) {
        const t = new GMLPointT();
        t.value = this.children.time[0].value;
        this.children.t = [t];
      }
      delete this.children.time;
    }
  }
  get values() {
    return Object.keys(this.children).reduce((obj, key) => {
      return {
        ...obj,
        [key]: this.getChild([key, 0], {value: 0}).value
      };
    }, {});
  }
  getVector() {
    const { x, y, z } = this.values;
    return [ x, y, z || 0 ];
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