import GMLNode from './node';
import GMLClient from './client';
import GMLEnvironment from './environment';

export default class GMLHeader extends GMLNode {
  static getSupportedChildNodes() {
    return [
      GMLClient.getNodeDefinition(),
      GMLEnvironment.getNodeDefinition(),
    ];
  }
  static getTagName() {
    return 'header';
  }
}
