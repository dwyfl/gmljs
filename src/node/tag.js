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
    let env = this.getChildPath(['header', 'children', 'environment', 0]);
    if (env === null) {
      env = this.getChild('environment');
    }
    return env ? env.toObject() : null;
  }
}