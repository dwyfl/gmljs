import GMLNode from './node';
import GMLHeader from './header';
import GMLEnvironment from './environment';
import GMLDrawing from './drawing';

export default class GMLTag extends GMLNode {
  static getSupportedChildNodes() {
    return [
      GMLHeader.getNodeDefinition(),
      GMLEnvironment.getNodeDefinition(),
      GMLDrawing.getNodeDefinition({required: true}),
    ];
  }
  static getTagName() {
    return 'tag';
  }
  /* getEnvironment() {
    var env = null;
    if (this.environment)
      env = this.environment;
    else if (this.header && this.header.environment)
      env = this.header.environment;
    return env ? env.toObject() : null;
  } */
}