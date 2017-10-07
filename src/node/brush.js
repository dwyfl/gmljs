import GMLNode from './node';
import GMLColor from './color';
import GMLPoint from './point';
import { GMLLeafNode, GMLFloatNode, GMLIntNode } from './leafnode';

export default class GMLDocument extends GMLNode {
  static getSupportedChildNodes() {
    return [
      GMLColor.getNodeDefinition(),
      GMLMode.getNodeDefinition(),
      GMLUniqueStyleID.getNodeDefinition(),
      GMLSpec.getNodeDefinition(),
      GMLWidth.getNodeDefinition(),
      GMLSpeedToWidthRatio.getNodeDefinition(),
      GMLDripAmnt.getNodeDefinition(),
      GMLDripSpeed.getNodeDefinition(),
      GMLLayerAbsolute.getNodeDefinition(),
      GMLLayerRelative.getNodeDefinition(),
      GMLDripVecRelativeToUp.getNodeDefinition(),
    ];
  }
  static getTagName() {
    return 'brush';
  }
}

class GMLMode extends GMLLeafNode {
  static getTagName() {
    return 'mode';
  }
}
class GMLUniqueStyleID extends GMLLeafNode {
  static getTagName() {
    return 'uniquestyleid';
  }
}
class GMLSpec extends GMLLeafNode {
  static getTagName() {
    return 'spec';
  }
}
class GMLWidth extends GMLFloatNode {
  static getTagName() {
    return 'width';
  }
}
class GMLSpeedToWidthRatio extends GMLFloatNode {
  static getTagName() {
    return 'speedtowidthratio';
  }
}
class GMLDripAmnt extends GMLFloatNode {
  static getTagName() {
    return 'dripamnt';
  }
}
class GMLDripSpeed extends GMLFloatNode {
  static getTagName() {
    return 'dripspeed';
  }
}
class GMLLayerAbsolute extends GMLIntNode {
  static getTagName() {
    return 'layerabsolute';
  }
}
class GMLLayerRelative extends GMLIntNode {
  static getTagName() {
    return 'layerrelative';
  }
}
class GMLDripVecRelativeToUp extends GMLPoint {
  static getTagName() {
    return 'dripvecrelativetoup';
  }
}
