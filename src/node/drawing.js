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
    const node = this.getChild('stroke');
    return index === undefined ? node.children.stroke : node.getChild(['stroke', index]);
  }
}