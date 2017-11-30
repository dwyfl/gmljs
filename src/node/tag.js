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
    let env = this.getChildPath(['header', ['environment', 0]]);
    if (env === null) {
      env = this.getChild(['environment', 0]);
    }
    return env ? env.toObject() : null;
  }
  getClientName() {
    return this.getChildPath(['header', 'client', 'name'], {value: null}).value;
  }
  getDrawings(index) {
    return this.getChild(index === undefined ? 'drawing' : ['drawing', index]);
  }
}