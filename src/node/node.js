import _ from 'lodash';
import { formatXmlTagStart, formatXmlTagEnd } from '../util/xml';

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
    return Object.assign({
      name: this.getTagName(),
      model: this,
    }, options);
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
    this.constructor.getSupportedChildNodes()
      .filter(n => !!n.required)
      .forEach(n => {
        this.addChild(n.name, n.model.create());
      });
    this.constructor.getSupportedAttributes()
      .filter(a => a.hasOwnProperty('default'))
      .forEach(a => {
        this.attributes[a.name] = a.default;
      });
  }
  addChild(type, child) {
    if (this.children[type] === undefined) {
      this.children[type] = [];
    }
    this.children[type].push(child);
  }
  getChild(child, defaultValue = null) {
    return this.children[child] && this.children[child].length
      ? this.children[child][0]
      : defaultValue;
  }
  getChildPath(path, defaultValue = null) {
    return _.get(this.children, path, defaultValue);
  }
  toObject() {
    return Object.keys(this.children).reduce((obj, tag) => {
      return {
        ...obj,
        [tag]: this.children[tag].map(item => item.toObject()),
      };
    }, {});
  }
  toString() {
    return this.getTagStart() + this.getTagContent() + this.getTagEnd();
  }
  getTagStart() {
    return formatXmlTagStart(this.constructor.getTagName(), this.attributes);
  }
  getTagContent() {
    return Object.keys(this.children).map(
      tag => this.children[tag].map(item => item.toString()).join('')
    ).join('');
  }
  getTagEnd() {
    return formatXmlTagEnd(this.constructor.getTagName());
  }
  parseChildNodes(node) {
    const supportedNodes = this.constructor.getSupportedChildNodes();
    if (node && node.childNodes && node.childNodes.length) {
      for (let i = 0; i < node.childNodes.length; ++i) {
        const n = node.childNodes[i];
        const name = n.nodeName.toLowerCase();
        const def = supportedNodes.find(item => item.name === name);
        if (def) {
          this.addChild(def.name, def.model.create(n));
        }
      }
    }
    supportedNodes
      .filter(n => !!n.required)
      .forEach(n => {
        if (this.children[n.name] === undefined || !this.children[n.name].length) {
          if (n.initDefault) {
            this.addChild(n.name, n.model.create());
          }
          else {
            throw new Error(`Invalid GML! A "${this.constructor.getTagName()}" node requires a "${n.name}" child node.`);
          }
        }
      });
  }
  parseAttributes(node) {
    const supportedAttributes = this.constructor.getSupportedAttributes();
    if (node && node.attributes && node.attributes.length) {
      for (let i = 0; i < node.attributes.length; ++i) {
        const a = node.attributes.item(i);
        const name = a.nodeName.toLowerCase();
        const value = a.value;
        const def = supportedAttributes.find(item => item.name === name);
        if (def) {
          this.attributes[name] = typeof def.parser === 'function'
            ? def.parser(value)
            : value;
        }
      }
    }
    supportedAttributes
      .filter(a => !!a.required)
      .forEach(a => {
        if (this.attributes[a.name] === undefined) {
          throw new Error(`Invalid GML! A "${this.constructor.getTagName()}" node requires a "${a.name}" attribute.`);
        }
      });
  }
}