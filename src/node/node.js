import _ from 'lodash';
import { formatXmlTagStart, formatXmlTagEnd } from '../util';

export default class GMLNode {
  constructor() {
    this.attributes = {};
    this.children = {};
    this.value = undefined;
  }
  static getSupportedChildNodes() {
    return [];
  }
  static getSupportedAttributes() {
    return [];
  }
  static getTagName() {
    throw new Error('GMLNode::getTagName() needs to be overridden by subclass.');
  }
  static getNodeDefinition(options = {}) {
    return Object.assign(options, {
      name: this.getTagName(),
      model: this,
    });
  }
  static create(node) {
    var obj = new this();
    obj.init(node);
    return obj;
  }
  init(node) {
    this.preInit();
    if (node === undefined) {
      this.initDefault();
    }
    else {
      this.parseChildNodes(node);
      this.parseAttributes(node);
      this.value = node.textContent;
    }
    this.postInit();
  }
  preInit() {}
  postInit() {}
  initDefault() {
    this.getSupportedChildNodes()
      .filter(n => !!n.required)
      .forEach(n => {
        if (this.children[n.name] === undefined) {
          this.children[n.name] = [];
        }
        this.children[n.name].push(n.model.create());
      });
    this.getSupportedAttributes()
      .filter(a => a.hasOwnProperty('default'))
      .forEach(a => {
        this.attributes[a.name] = a.default;
      });
  }
  getChildPath(path, defaultValue = null) {
    return _.get(this.children, path, defaultValue);
  }
  toString() {
    return this.getTagStart() + this.getTagContent() + this.getTagEnd();
  }
  getTagStart() {
    return formatXmlTagStart(this.getTagName(), this.attributes);
  }
  getTagContent() {
    return this.children.map(item => item.toString()).join('');
  }
  getTagEnd() {
    return formatXmlTagEnd(this.getTagName());
  }
  parseChildNodes(node) {
    const supportedNodes = this.getSupportedChildNodes();
    node.childNodes.forEach(n => {
      const name = n.nodeName.toLowerCase();
      const key = _.findKey(supportedNodes, nn => nn.name === name);
      if (key) {
        if (this.children[name] === undefined) {
          this.children[name] = [];
        }
        this.children[name].push(supportedNodes[key].model.create(n));
      }
    });
    supportedNodes
      .filter(n => !!n.required)
      .forEach(n => {
        if (this.children[n.name] === undefined || !this.children[n.name].length) {
          throw new Error(`Invalid GML! A "${this.getTagName()}" node requires a "${n.name}" child node.`);
        }
      });
  }
  parseAttributes(node) {
    const supportedAttributes = this.getSupportedAttributes();
    if (node.hasAttributes()) {
      node.attributes.forEach(a => {
        const name = a.name.toLowerCase();
        const value = a.value;
        const key = _.findKey(supportedAttributes, nn => nn.name === name);
        if (key) {
          this.attributes[name] = typeof supportedAttributes[key].parser === 'function'
            ? supportedAttributes[key].parser(value)
            : value;
        }
      });
    }
    supportedAttributes
      .filter(a => !!a.required)
      .forEach(a => {
        if (this.attributes[a.name] === undefined) {
          throw new Error(`Invalid GML! A "${this.getTagName()}" node requires a "${nn.name}" attribute.`);
        }
      });
  }
}