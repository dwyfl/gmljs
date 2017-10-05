import GMLNode from './node';
import GMLLeafNode from './leafnode';
import GMLLocation from './location';

export default class GMLRoot extends GMLNode {
  static getSupportedChildNodes() {
    return [
      {name: 'name',       model: GMLLeafNode}, // required: true ?
      {name: 'version',    model: GMLLeafNode}, // required: true ?
      {name: 'username',   model: GMLLeafNode},
      {name: 'permalink',  model: GMLLeafNode},
      {name: 'keywords',   model: GMLLeafNode},
      {name: 'uniqueKey',  model: GMLLeafNode},
      {name: 'ip',         model: GMLLeafNode},
      {name: 'time',       model: GMLLeafNode},
      GMLLocation.getNodeDefintion(),
    ];
  }
  static getTagName() {
    return 'client';
  }
}