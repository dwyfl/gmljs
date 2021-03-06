import GMLNode from './node';
import GMLRoot from './root';

export default class GMLDocument extends GMLNode {
  static getSupportedChildNodes() {
    return [
      GMLRoot.getNodeDefinition({initDefault: true}),
    ];
  }
  static getTagName() {
    throw new Error('GMLDocument is not a tag.');
  }
  toString() {
    return this.children.gml && this.children.gml.length
      ? this.children.gml[0].toString()
      : '';
  }
}
