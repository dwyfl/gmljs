import GMLNode from './node';
import { GMLLeafNode, GMLIntegerNode } from './leafnode';
import GMLLocation from './location';

export default class GMLClient extends GMLNode {
  static getSupportedChildNodes() {
    return [
      GMLName.getNodeDefinition(),
      GMLVersion.getNodeDefinition(),
      GMLTime.getNodeDefinition(),
      GMLUsername.getNodeDefinition(),
      GMLPermalink.getNodeDefinition(),
      GMLKeywords.getNodeDefinition(),
      GMLUniqueKey.getNodeDefinition(),
      GMLIp.getNodeDefinition(),
      GMLLocation.getNodeDefinition(),
    ];
  }
  static getTagName() {
    return 'client';
  }
  postInit() {
    // TODO: Add <version> if default <name> was created
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
class GMLTime extends GMLIntegerNode {
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