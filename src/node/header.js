import GMLNode from './node';
import GMLClient from './client';
import GMLEnvironment from './environment';

export default class GMLHeader extends GMLNode {
  static getSupportedChildNodes() {
    return [
      GMLClient.getNodeDefintion({required: true}),
      GMLEnvironment.getNodeDefintion({required: true}),
    ];
  }
  static getTagName() {
    return 'header';
  }
}
