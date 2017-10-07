import GMLNode from './node';
import { GMLFloatNode } from './leafnode';

export default class GMLLocation extends GMLNode {
  static getSupportedChildNodes() {
    return [
      GMLLocationLon.getNodeDefintion({required: true}),
      GMLLocationLat.getNodeDefintion({required: true}),
    ];
  }
  static getTagName() {
    return 'location';
  }
}

class GMLLocationLon extends GMLFloatNode {
  static getTagName() {
    return 'lon';
  }
}
class GMLLocationLat extends GMLFloatNode {
  static getTagName() {
    return 'lat';
  }
}