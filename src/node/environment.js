import GMLNode from './node';
import GMLLeafNode from './leafnode';
import GMLPoint from './point';

export default class GMLEnvironment extends GMLNode {
  static getSupportedChildNodes() {
    return [
      GMLOffset.getNodeDefinition(),
      GMLRotation.getNodeDefinition(),
      GMLUp.getNodeDefinition({initDefault: true}),
      GMLScreenBounds.getNodeDefinition({initDefault: true}),
      GMLOrigin.getNodeDefinition(),
      GMLRealScale.getNodeDefinition(),
      GMLAudio.getNodeDefinition(),
      GMLBackground.getNodeDefinition(),
    ];
  }
  static getTagName() {
    return 'environment';
  }
}

class GMLOffset extends GMLPoint {
  static getTagName() {
    return 'offset';
  }
}
class GMLRotation extends GMLPoint {
  static getTagName() {
    return 'rotation';
  }
}
class GMLUp extends GMLPoint {
  static getTagName() {
    return 'up';
  }
  initDefault() {
    this.set({x: 0.0, y: -1.0, z: 0.0});
  }
}
class GMLScreenBounds extends GMLPoint {
  static getTagName() {
    return 'screenbounds';
  }
  initDefault() {
    this.set({x: 1920, y: 1080, z: 0});
  }
}
class GMLOrigin extends GMLPoint {
  static getTagName() {
    return 'origin';
  }
}
class GMLRealScale extends GMLPoint {
  static getTagName() {
    return 'realscale';
  }
}
class GMLAudio extends GMLLeafNode {
  static getTagName() {
    return 'audio';
  }
}
class GMLBackground extends GMLLeafNode {
  static getTagName() {
    return 'background';
  }
}
