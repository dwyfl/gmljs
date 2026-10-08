import { GMLParseError } from "../errors.ts";
import { formatXmlTagStart, formatXmlTagEnd } from "../util/xml.ts";
import type { GMLNodeAtPath, GMLNodeTypeMap } from "./type-map.ts";
import {
  type GMLAttributeDefinition,
  type GMLChildNodeDefinition,
  GMLNodeAttribute,
  type GMLNodeAttributes,
  type GMLNodeAttributeValue,
  type GMLNodeChildPath,
  type GMLNodeChildren,
  type GMLNodeDefinition,
  GMLNodeName,
  type GMLNodeValue,
  type GMLObjectRepresentation,
  type GMLParsedNode,
  isGMLNodeAttribute,
  isGMLNodeName,
  toXmlName,
} from "./types.ts";

/** Creates a node, populating it from `data` (or with defaults) and validating it. */
export function createGmlNode(definition: GMLNodeDefinition, data?: GMLParsedNode): GMLNode {
  const node = new definition.model(definition);
  node.init(data);
  node.verifyAttributes();
  node.verifyChildren();
  return node;
}

const childDefinitionCache = new WeakMap<
  GMLNodeDefinition,
  Map<GMLNodeName, GMLChildNodeDefinition>
>();

/** The allowed children of a definition, keyed by tag name. */
const getChildDefinitions = (definition: GMLNodeDefinition) => {
  let map = childDefinitionCache.get(definition);
  if (!map) {
    map = new Map();
    for (const item of definition.children) {
      const childDefinition = "model" in item ? { definition: item } : item;
      const { name } = childDefinition.definition;
      if (!map.has(name)) {
        map.set(name, childDefinition);
      }
    }
    childDefinitionCache.set(definition, map);
  }
  return map;
};

export abstract class GMLNode {
  definition: GMLNodeDefinition;
  attributes: GMLNodeAttributes = {};
  children: GMLNodeChildren = {};
  value: GMLNodeValue = "";

  /** Use `createGmlNode()` (or the other factories) to create populated nodes. */
  constructor(definition: GMLNodeDefinition) {
    this.definition = definition;
  }

  init(data?: GMLParsedNode) {
    this.definition.attributes.forEach((item) => {
      if (item.defaultValue !== undefined) {
        this.setAttribute(item.name, item.defaultValue);
      }
    });
    if (data) {
      this.parseValue(data);
      this.parseAttributes(data);
      this.parseChildNodes(data);
    } else {
      for (const { definition, initDefault } of getChildDefinitions(this.definition).values()) {
        if (initDefault) {
          this.addChild(definition.name, createGmlNode(definition));
        }
      }
    }
  }

  verifyAttributes() {
    this.definition.attributes.forEach(({ name, required }) => {
      if (required && this.getAttribute(name) === undefined) {
        throw new GMLParseError(
          `Invalid GML: A "${this.definition.name}" node requires a "${name}" attribute.`,
        );
      }
    });
  }

  verifyChildren() {
    for (const { definition, required } of getChildDefinitions(this.definition).values()) {
      if (required && !this.hasChild(definition.name)) {
        throw new GMLParseError(
          `Invalid GML: A "${this.definition.name}" node requires a "${definition.name}" child node.`,
        );
      }
    }
  }

  setAttribute(key: GMLNodeAttribute, value: GMLNodeAttributeValue) {
    this.attributes[key] = value;
  }

  getAttribute(key: GMLNodeAttribute) {
    return this.attributes[key];
  }

  addChild(name: GMLNodeName, child: GMLNode) {
    (this.children[name] ??= []).push(child);
  }

  /** Removes the child at `index`, or all children named `name` if no index is given. */
  removeChild(name: GMLNodeName, index?: number) {
    const children = this.children[name];
    if (!children) {
      return;
    }
    if (index === undefined) {
      delete this.children[name];
      return;
    }
    if (index < 0 || index >= children.length) {
      return;
    }
    children.splice(index, 1);
    if (!children.length) {
      delete this.children[name];
    }
  }

  hasChild(name: GMLNodeName): boolean {
    return (this.children[name]?.length ?? 0) > 0;
  }

  hasChildren(): boolean {
    return Object.keys(this.children).length > 0;
  }

  getChild<N extends GMLNodeName>(child: N | readonly [N, number]): GMLNodeTypeMap[N] | undefined {
    const name: N = typeof child === "string" ? child : child[0];
    const index = typeof child === "string" ? 0 : child[1];
    return this.getChildren(name)?.[index];
  }

  getChildren<N extends GMLNodeName>(name: N): GMLNodeTypeMap[N][] | undefined {
    // Children are only ever created from the definition registered for their name.
    return this.children[name] as GMLNodeTypeMap[N][] | undefined;
  }

  getChildPath<const P extends readonly GMLNodeChildPath[]>(path: P): GMLNodeAtPath<P> | undefined {
    if (!path.length) {
      return undefined;
    }
    const node = path.reduce<GMLNode | undefined>(
      (parent, segment) => parent?.getChild(segment),
      this,
    );
    return node as GMLNodeAtPath<P> | undefined;
  }

  getChildValue(path: readonly GMLNodeChildPath[]): GMLNodeValue | undefined {
    return this.getChildPath(path)?.value;
  }

  getChildValueString(path: readonly GMLNodeChildPath[]): string {
    return String(this.getChildValue(path) ?? "");
  }

  getValue() {
    return this.value;
  }

  setValue(value: GMLNodeValue) {
    this.value = value;
  }

  /** Only leaf nodes carry a value; see `GMLLeafNode`. */
  parseValue(_data: GMLParsedNode) {}

  parseAttributes(data: GMLParsedNode) {
    if (!("attributes" in data)) {
      return;
    }
    for (let i = 0; i < data.attributes.length; ++i) {
      const attr = data.attributes.item(i);
      const name = attr?.nodeName.toLowerCase();
      if (attr && isGMLNodeAttribute(name)) {
        const attributeDefinition = this.getAttributeDefinition(name);
        if (attributeDefinition) {
          this.setAttribute(name, attributeDefinition.parse?.(attr.value) ?? attr.value);
        }
      }
    }
  }

  parseChildNodes(data: GMLParsedNode) {
    const { childNodes } = data;
    for (let i = 0; i < childNodes.length; ++i) {
      const child = childNodes.item(i);
      const name = child?.nodeName.toLowerCase();
      if (!child || !isGMLNodeName(name)) {
        continue;
      }
      let node: GMLNode | undefined;
      try {
        node = this.createChildNode(name, child);
      } catch (error) {
        if (error instanceof GMLParseError) {
          throw error.withParent(`${toXmlName(name)}[${this.children[name]?.length ?? 0}]`);
        }
        throw error;
      }
      if (node) {
        this.addChild(name, node);
      }
    }
  }

  /** Creates a child node, or returns undefined if this node doesn't allow a `name` child. */
  protected createChildNode(name: GMLNodeName, data?: GMLParsedNode): GMLNode | undefined {
    const childDefinition = this.getChildNodeDefinition(name);
    return childDefinition && createGmlNode(childDefinition.definition, data);
  }

  getChildNodeDefinition(name: GMLNodeName): GMLChildNodeDefinition | undefined {
    return getChildDefinitions(this.definition).get(name);
  }

  getAttributeDefinition(name: GMLNodeAttribute): GMLAttributeDefinition | undefined {
    return this.definition.attributes.find((item) => item.name === name);
  }

  getTagStart() {
    const attributes: Record<string, string> = {};
    for (const [key, value] of Object.entries(this.attributes)) {
      if (!isGMLNodeAttribute(key) || value === undefined) {
        continue;
      }
      const stringify = this.getAttributeDefinition(key)?.stringify;
      attributes[toXmlName(key)] = stringify ? stringify(value) : String(value);
    }
    return formatXmlTagStart(toXmlName(this.definition.name), attributes);
  }

  getTagEnd() {
    return formatXmlTagEnd(toXmlName(this.definition.name));
  }

  getTagContent(): string {
    return Object.values(this.children)
      .map((children) => children.map((item) => item.toString()).join(""))
      .join("");
  }

  toString(): string {
    return `${this.getTagStart()}${this.getTagContent()}${this.getTagEnd()}`;
  }

  toObject(): GMLObjectRepresentation {
    const result: Record<string, GMLObjectRepresentation[]> = {};
    for (const [name, children] of Object.entries(this.children)) {
      result[name] = children.map((item) => item.toObject());
    }
    return result;
  }
}
