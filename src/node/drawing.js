import GMLNode from './node';
import GMLStroke from './stroke';

export default class GMLDrawing extends GMLNode {
  static getSupportedChildNodes() {
    return [
      GMLStroke.getNodeDefinition(),
    ];
  }
  static getTagName() {
    return 'drawing';
  }
  getStrokes(index) {
    return this.getChild(index === undefined ? 'stroke' : ['stroke', index]);
  }
}