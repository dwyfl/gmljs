import GMLNode from './node';
import GMLClient from './client';
import GMLEnvironment from './environment';

export default class GMLHeader extends GMLNode {
  static getSupportedChildNodes() {
    return [
      GMLClient.getNodeDefinition(), // TODO: Set defaults
      GMLEnvironment.getNodeDefinition(), // TODO: Set defaults
    ];
  }
  static getTagName() {
    return 'header';
  }
}
