import { formatXmlTagStart, formatXmlTagEnd } from './util';

type GMLParsedNode = Document | Element;

export type GMLNodeValue = string | number;
export type GMLNodeAttributeValue = string | number;
export type GMLNodeChildPath = string | [string, number];

export interface GMLNodeAttributes {
  [key: string]: GMLNodeAttributeValue
}
export interface GMLNodeChildren {
  [key: string]: GMLNode[]
}
export interface GMLNodeDefinition {
  name: string
  model: (typeof GMLNode)
  required?: boolean
  initDefault?: boolean
}
export interface GMLAttributeDefinition {
  name: string
  parser?: (value: string) => GMLNodeAttributeValue
  required?: boolean
  defaultValue?: GMLNodeAttributeValue
}

export abstract class GMLNode {

  ['constructor']: typeof GMLNode;

  attributes: GMLNodeAttributes = {};
  children: GMLNodeChildren = {};
  value: GMLNodeValue = '';

  public static getTagName(): string {
    throw new Error('GMLNode::getTagName() needs to be overridden by subclass.');
  }
  public static getSupportedChildNodes(): GMLNodeDefinition[] {
    return [];
  }
  public static getSupportedAttributes(): GMLAttributeDefinition[] {
    return [];
  }
  public static getChildNodeDefinition(name: string) {
    return this.getSupportedChildNodes().find(item => item.name === name);
  }
  public static getAttributeDefinition(name: string) {
    return this.getSupportedAttributes().find(item => item.name === name);
  }
  public static getNodeDefinition(options: object = {}): GMLNodeDefinition {
    return {
      name: this.getTagName(),
      model: this,
      ...options,
    };
  }
  public static create<T extends GMLNode>(Ctor: { new(...args: any[]): T; }): T {
    const obj: T = new Ctor();
    obj.init();
    return obj;
  }
  public init(node?: GMLParsedNode): void {
    this.preInit();
    if (node === undefined) {
      this.initDefault();
    }
    else {
      this.parseChildNodes(node);
      this.parseAttributes(node);
      this.parseValue(node.textContent !== null ? node.textContent : '');
    }
    this.postInit();
  }
  public preInit(): void { }
  public postInit(): void { }
  public initDefault(): void {
    this.attributes =
      this.constructor.getSupportedAttributes()
        .filter(item => item.hasOwnProperty('defaultValue'))
        .reduce((result, attr) => ({ ...result, [attr.name]: attr.defaultValue }), {});
    this.constructor.getSupportedChildNodes()
      .filter(item => !!item.initDefault)
      .forEach(item => this.addChild(item.name, GMLNode.create(item.model)));
  }
  public addChild(name: string, child: GMLNode): void {
    if (this.children[name] === undefined) {
      this.children[name] = [];
    }
    this.children[name].push(child);
  }
  private _getChildNode(child: GMLNodeChildPath): GMLNode | undefined {
    let name: string = '';
    let index: number = 0;
    if (Array.isArray(child)) {
      [name, index] = child;
    } else if (typeof child === 'string') {
      name = child;
    }
    return this.children.hasOwnProperty(name) ? this.children[name][index] : undefined;
  }
  public getChildNode(path: GMLNodeChildPath[]): GMLNode | undefined {
    if (!path) {
      return undefined;
    }
    const node = path.length ? this._getChildNode(path[0]) : undefined;
    return node === undefined || path.length <= 1
      ? node
      : node.getChildNode(path.slice(1));
  }
  public getChildValue(path: GMLNodeChildPath[], defaultValue?: GMLNodeValue): GMLNodeValue | undefined {
    const node = this.getChildNode(path);
    return node ? node.value : defaultValue;
  }
  public getAttribute(name: string, defaultValue?: GMLNodeAttributeValue): GMLNodeAttributeValue | undefined {
    return this.attributes[name] === undefined && defaultValue !== undefined
      ? defaultValue
      : this.attributes[name];
  }
  public toObject(): object {
    return Object.keys(this.children).reduce((obj, tag) => {
      return {
        ...obj,
        [tag]: this.children[tag].map(item => item.toObject()),
      };
    }, {});
  }
  public toString(): string {
    return this.getTagStart() + this.getTagContent() + this.getTagEnd();
  }
  private getTagStart(): string {
    return formatXmlTagStart(this.constructor.getTagName(), this.attributes);
  }
  private getTagContent(): string {
    return Object.keys(this.children).map(
      tag => this.children[tag].map(item => item.toString()).join('')
    ).join('');
  }
  private getTagEnd(): string {
    return formatXmlTagEnd(this.constructor.getTagName());
  }
  private parseChildNodes(node: GMLParsedNode): void {
    const supportedNodes = this.constructor.getSupportedChildNodes();
    if (node && node.childNodes && node.childNodes.length) {
      for (let i = 0; i < node.childNodes.length; ++i) {
        const child = node.childNodes[i];
        const name = child.nodeName.toLowerCase();
        const def = supportedNodes.find(item => item.name === name);
        if (def) {
          this.addChild(def.name, def.model.create(child));
        }
      }
    }
    supportedNodes
      .filter(n => !!n.required)
      .forEach(n => {
        if (this.children[n.name] === undefined || !this.children[n.name].length) {
          throw new Error(`Invalid GML! A "${this.constructor.getTagName()}" node requires a "${n.name}" child node.`);
        }
      });
  }
  private parseAttributes(node: GMLParsedNode): void {
    const supportedAttributes = this.constructor.getSupportedAttributes();
    if (node instanceof Element && node.attributes && node.attributes.length) {
      for (let i = 0; i < node.attributes.length; ++i) {
        const attr = <Attr>node.attributes.item(i);
        const name = attr.nodeName.toLowerCase();
        const value = attr.value;
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
  protected parseValue(value: string): string {
    const strValue = value.split('\n').shift();
    this.value = strValue !== undefined ? strValue : '';
    return this.value;
  }
}
