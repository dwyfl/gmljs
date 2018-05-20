import GMLNode from './node';
import GMLBrush from './stroke';
import GMLPoint from './point';
import { GMLLeafNodeParent, GMLLeafNode } from './leafnode';

export default class GMLStroke extends GMLNode {
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
        parser: value => typeof value === 'string' ? value === 'true' : !!value
      }
    ];
  }
  static getTagName() {
    return 'stroke';
  }
  static createFromPointArray(points) {
    const stroke = new GMLStroke();
    stroke.children.pt = points.map(p => GMLPoint.createFromObject(p));
    return stroke;
  }
  isDrawing() {
    return !!this.getAttribute('isdrawing', true);
  }
  getPoints(index) {
    return this.getChild(index === undefined ? 'pt' : ['pt', index]);
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
