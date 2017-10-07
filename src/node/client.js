import GMLNode from './node';
import { GMLLeafNode, GMLIntNode } from './leafnode';
import GMLLocation from './location';

export default class GMLRoot extends GMLNode {
  static getSupportedChildNodes() {
    return [
      GMLName.getNodeDefintion({required: true}),
      GMLVersion.getNodeDefintion({required: true}),
      GMLTime.getNodeDefintion({required: true}),
      GMLUsername.getNodeDefintion(),
      GMLPermalink.getNodeDefintion(),
      GMLKeywords.getNodeDefintion(),
      GMLUniqueKey.getNodeDefintion(),
      GMLIp.getNodeDefintion(),
      GMLLocation.getNodeDefintion(),
    ];
  }
  static getTagName() {
    return 'client';
  }
}

class GMLName extends GMLLeafNode {
  static getTagName() {
    return 'name';
  }
  initDefault() {
    this.value = 'GML.js';
  }
}
class GMLVersion extends GMLLeafNode {
  static getTagName() {
    return 'version';
  }
  initDefault() {
    this.value = '1.0';
  }
}
class GMLTime extends GMLIntNode {
  static getTagName() {
    return 'time';
  }
  initDefault() {
    this.value = Math.floor(Date.now() * 0.001);
  }
}
class GMLUsername extends GMLLeafNode {
  static getTagName() {
    return 'username';
  }
}
class GMLPermalink extends GMLLeafNode {
  static getTagName() {
    return 'permalink';
  }
}
class GMLKeywords extends GMLLeafNode {
  static getTagName() {
    return 'keywords';
  }
}
class GMLUniqueKey extends GMLLeafNode {
  static getTagName() {
    return 'uniquekey';
  }
}
class GMLIp extends GMLLeafNode {
  static getTagName() {
    return 'ip';
  }
}