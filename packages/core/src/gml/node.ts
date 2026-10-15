import { GMLParseError } from "../errors.ts";
import { formatXmlTagStart, formatXmlTagEnd, serializeXml } from "../util/xml.ts";
import { GMLUnknownNode } from "./unknown.ts";
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
  type GMLParseContext,
  type GMLParsedNode,
  type GMLParseOptions,
  isGMLNodeAttribute,
  isGMLNodeName,
  toXmlName,
} from "./types.ts";

const ELEMENT_NODE = 1;

export const createParseContext = (options: GMLParseOptions = {}): GMLParseContext => ({
  strict: options.strict ?? false,
  onWarning: options.onWarning,
  path: [],
});

/** Creates a node, populating it from `data` (or with defaults) and validating it. */
export function createGmlNode<T extends GMLNode>(
  definition: GMLNodeDefinition<T>,
  data?: GMLParsedNode,
  options?: GMLParseOptions,
): T {
  return buildNode(definition, data, createParseContext(options));
}

function buildNode<T extends GMLNode>(
  definition: GMLNodeDefinition<T>,
  data: GMLParsedNode | undefined,
  context: GMLParseContext,
): T {
  const node = new definition.model(definition);
  node.init(data, context);
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
  readonly definition: GMLNodeDefinition;
  attributes: GMLNodeAttributes = {};
  #children: GMLNodeChildren = {};
  value: GMLNodeValue = "";
  /** Attributes gmljs doesn't know for this node, by their name in the document. */
  unknownAttributes: Map<string, string> = new Map();
  /** All children in document order, including unknown elements. */
  #childNodes: (GMLNode | GMLUnknownNode)[] = [];

  /** Use `createGmlNode()` (or the other factories) to create populated nodes. */
  constructor(definition: GMLNodeDefinition) {
    this.definition = definition;
  }

  /** Children by tag name. Use addChild()/removeChild() to change them. */
  get children(): Readonly<Partial<Record<GMLNodeName, readonly GMLNode[]>>> {
    return this.#children;
  }

  init(data?: GMLParsedNode, context: GMLParseContext = createParseContext()) {
    // Parsed nodes keep exactly what the input had; defaults only apply to new nodes.
    if (data) {
      this.parseValue(data);
      this.parseAttributes(data);
      this.parseChildNodes(data, context);
    } else {
      this.definition.attributes.forEach((item) => {
        if (item.defaultValue !== undefined) {
          this.setAttribute(item.name, item.defaultValue);
        }
      });
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
          `Invalid GML: A "${toXmlName(this.definition.name)}" node requires a "${toXmlName(name)}" attribute.`,
        );
      }
    });
  }

  verifyChildren() {
    for (const { definition, required } of getChildDefinitions(this.definition).values()) {
      if (required && !this.hasChild(definition.name)) {
        throw new GMLParseError(
          `Invalid GML: A "${toXmlName(this.definition.name)}" node requires a "${toXmlName(definition.name)}" child node.`,
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
    (this.#children[name] ??= []).push(child);
    this.#childNodes.push(child);
  }

  addUnknownChild(child: GMLUnknownNode) {
    this.#childNodes.push(child);
  }

  /** Removes the child at `index`, or all children named `name` if no index is given. */
  removeChild(name: GMLNodeName, index?: number) {
    const children = this.#children[name];
    if (!children) {
      return;
    }
    if (index !== undefined && (index < 0 || index >= children.length)) {
      return;
    }
    const removed = new Set<GMLNode>(
      index === undefined ? children.splice(0) : children.splice(index, 1),
    );
    if (!children.length) {
      delete this.#children[name];
    }
    this.#childNodes = this.#childNodes.filter((node) => !removed.has(node as GMLNode));
  }

  hasChild(name: GMLNodeName): boolean {
    return (this.#children[name]?.length ?? 0) > 0;
  }

  hasChildren(): boolean {
    return Object.keys(this.children).length > 0;
  }

  /** All children in document order, including unknown elements. */
  getChildNodes(): readonly (GMLNode | GMLUnknownNode)[] {
    return this.#childNodes;
  }

  getUnknownChildren(): GMLUnknownNode[] {
    return this.#childNodes.filter((node) => node instanceof GMLUnknownNode);
  }

  getChild<N extends GMLNodeName>(child: N | readonly [N, number]): GMLNodeTypeMap[N] | undefined {
    const name: N = typeof child === "string" ? child : child[0];
    const index = typeof child === "string" ? 0 : child[1];
    return this.getChildren(name)?.[index];
  }

  getChildren<N extends GMLNodeName>(name: N): readonly GMLNodeTypeMap[N][] | undefined {
    // Children are only ever created from the definition registered for their name.
    return this.#children[name] as GMLNodeTypeMap[N][] | undefined;
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
      if (!attr) {
        continue;
      }
      const name = attr.nodeName.toLowerCase();
      const attributeDefinition = isGMLNodeAttribute(name)
        ? this.getAttributeDefinition(name)
        : undefined;
      if (attributeDefinition) {
        this.setAttribute(
          attributeDefinition.name,
          attributeDefinition.parse?.(attr.value) ?? attr.value,
        );
      } else {
        this.unknownAttributes.set(attr.nodeName, attr.value);
      }
    }
  }

  parseChildNodes(data: GMLParsedNode, context: GMLParseContext = createParseContext()) {
    const { childNodes } = data;
    const counts = new Map<string, number>();
    for (let i = 0; i < childNodes.length; ++i) {
      const child = childNodes.item(i);
      if (!child || child.nodeType !== ELEMENT_NODE) {
        continue;
      }
      const name = child.nodeName.toLowerCase();
      const index = counts.get(name) ?? 0;
      counts.set(name, index + 1);
      const childDefinition = isGMLNodeName(name) ? this.getChildNodeDefinition(name) : undefined;
      if (!childDefinition) {
        this.addUnknownChild(new GMLUnknownNode(child.nodeName, serializeXml(child)));
        continue;
      }
      const { definition } = childDefinition;
      context.path.push(`${toXmlName(definition.name)}[${index}]`);
      try {
        this.addChild(definition.name, buildNode(definition, child, context));
      } catch (error) {
        if (!(error instanceof GMLParseError)) {
          throw error;
        }
        // Errors are located by the closest parent; ancestors pass them on unchanged.
        const located = error.path.length
          ? error
          : new GMLParseError(error.reason, { path: [...context.path], cause: error.cause });
        if (context.strict) {
          throw located;
        }
        context.onWarning?.(located);
        this.addUnknownChild(new GMLUnknownNode(child.nodeName, serializeXml(child)));
      } finally {
        context.path.pop();
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
    for (const [key, value] of this.unknownAttributes) {
      attributes[key] = value;
    }
    return formatXmlTagStart(toXmlName(this.definition.name), attributes);
  }

  getTagEnd() {
    return formatXmlTagEnd(toXmlName(this.definition.name));
  }

  getTagContent(): string {
    return this.#childNodes.map((item) => item.toString()).join("");
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
