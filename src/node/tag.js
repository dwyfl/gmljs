import GMLNode from './node';
import GMLHeader from './header';
import GMLEnvironment from './environment';
import GMLDrawing from './drawing';

export default class GMLTag extends GMLNode {
  static getSupportedChildNodes() {
    return [
      GMLEnvironment.getNodeDefinition(),
      GMLHeader.getNodeDefinition(),
      GMLDrawing.getNodeDefinition({initDefault: true}),
    ];
  }
  static getTagName() {
    return 'tag';
  }
  getEnvironment() {
    let env = this.getChildPath(['header', 'environment']);
    if (env === null) {
      env = this.getChild('environment');
    }
    return env ? env.toObject() : null;
  }
  getDrawings(index) {
    const node = this.getChild('drawing');
    return index === undefined ? node.children.drawing : node.getChild(['drawing', index]);
  }
}