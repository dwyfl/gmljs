import GMLNode from './node';
import GMLTag from './tag';

export default class GMLRoot extends GMLNode {
  static getSupportedChildNodes() {
    return [
      GMLTag.getNodeDefinition({initDefault: true}),
    ];
  }
  static getSupportedAttributes() {
    return [
      { name: 'spec', default: '1.0' },
    ];
  }
  static getTagName() {
    return 'gml';
  }
}