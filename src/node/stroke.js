import GMLNode from './node';
import GMLBrush from './stroke';
import GMLPoint from './point';
import { GMLLeafNodeParent, GMLLeafNode } from './leafnode';

export default class GMLDrawing extends GMLNode {
  static getSupportedChildNodes() {
    return [
      GMLPoint.getNodeDefinition(),
      GMLBrush.getNodeDefinition(),
      GMLStrokeInfo.getNodeDefinition(),
    ];
  }
  static getSupportedAttributes() {
    return [
      {
        name: 'isdrawing',
        parser: value => typeof value === 'string' ? value !== 'false' : !!value
      }
    ];
  }
  static getTagName() {
    return 'stroke';
  }
  static createFromPointArray(points) {
    const stroke = new GMLStrokeInfo();
    stroke.children.pt = points.points(p => GMLPoint.createFromObject(p));
    return stroke;
  }
}

class GMLStrokeInfo extends GMLLeafNodeParent {
  static getSupportedChildNodes() {
    return [
      GMLStrokeInfoCurved.getNodeDefinition(),
    ];
  }
  static getTagName() {
    return 'info';
  }
}
class GMLStrokeInfoCurved extends GMLLeafNode {
  static getTagName() {
    return 'curved';
  }
}
