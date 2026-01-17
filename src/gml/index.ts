import { formatXmlTagStart, formatXmlTagEnd } from "../util/xml";
import gmlNodeClassMap, { getGMLNodeDefinition } from "./map";
import {
  GMLAttributeDefinition,
  GMLChildNodeDefinition,
  GMLNodeAttribute,
  GMLNodeAttributes,
  GMLNodeAttributeValue,
  GMLNodeChildPath,
  GMLNodeChildren,
  GMLNodeDefinition,
  GMLNodeInterface,
  GMLNodeName,
  GMLNodeValue,
  GMLObjectRepresentation,
  GMLParsedNode,
} from "./types";
import {
  createGMLChildNodeDefinition,
  createGmlNode,
  isGMLChildNodeDefinition,
  isGMLNodeAttribute,
  isGMLNodeName,
} from "./util";

export abstract class GMLNode implements GMLNodeInterface {
  definition: GMLNodeDefinition;
  attributes: GMLNodeAttributes = {};
  children: GMLNodeChildren = {};
  value: GMLNodeValue = "";

  constructor(definition: GMLNodeDefinition, data?: GMLParsedNode) {
    this.definition = definition;
    this.init(data);
    this.verifyAttributes();
    this.verifyChildren();
  }

  init(data?: GMLParsedNode) {
    // Apply attribute defaults first
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
      this.definition.children.forEach((item) => {
        if (typeof item === "object" && item.initDefault) {
          this.addChild(
            item.name,
            createGmlNode(getGMLNodeDefinition(item.name))
          );
        }
      });
    }
  }

  verifyAttributes() {
    // Check for required attributes
    this.definition.attributes.forEach(({ name, required }) => {
      if (required && this.getAttribute(name) === undefined) {
        throw new Error(
          `Invalid GML: A "${this.definition.name}" node requires a "${name}" attribute.`
        );
      }
    });
  }

  verifyChildren() {
    // Check for required children
    this.definition.children
      .filter(isGMLChildNodeDefinition)
      .forEach(({ name, required }) => {
        if (required && !this.hasChild(name)) {
          throw new Error(
            `Invalid GML: A "${this.definition.name}" node requires a "${name}" child node.`
          );
        }
      });
  }

  setAttribute(key: GMLNodeAttribute, value: GMLNodeAttributeValue) {
    this.attributes[key] = value;
  }

  getAttribute(key: GMLNodeAttribute) {
    return this.attributes[key];
  }

  addChild(name: GMLNodeName, child: GMLNode) {
    if (!Array.isArray(this.children[name])) {
      this.children[name] = [];
    }
    this.children[name]?.push(child);
  }

  removeChild(name: GMLNodeName, index?: number) {
    if (index) {
      this.children[name]?.splice(index, 1);
      if (!this.children[name]?.length) {
        delete this.children[name];
      }
    } else {
      delete this.children[name];
    }
  }

  hasChild(name: GMLNodeName): boolean {
    return Array.isArray(this.children[name]) && this.children[name].length > 0;
  }

  hasChildren(): boolean {
    return Object.keys(this.children).length > 0;
  }

  getChild<T extends GMLNodeInterface>(child: GMLNodeChildPath): T | undefined {
    let name: GMLNodeName;
    let index: number = 0;
    if (Array.isArray(child)) {
      [name, index] = child;
    } else if (typeof child === "string") {
      name = child;
    } else {
      return undefined;
    }
    return this.getChildren<T>(name)?.[index];
  }

  getChildren<T extends GMLNodeInterface>(name: GMLNodeName): T[] | undefined {
    return this.children[name] as T[];
  }

  getChildPath<T extends GMLNodeInterface>(
    path: GMLNodeChildPath[]
  ): T | undefined {
    if (!Array.isArray(path) || !path.length) {
      return undefined;
    }
    const node = this.getChild<T>(path[0]);
    return path.length > 1 ? node?.getChildPath<T>(path.slice(1)) : (node as T);
  }

  getChildValue(path: GMLNodeChildPath[]): GMLNodeValue | undefined {
    const node = this.getChildPath(path);
    return node?.value;
  }

  getChildValueString(path: GMLNodeChildPath[]): string {
    const node = this.getChildPath(path);
    return String(node?.value ?? "");
  }

  getValue() {
    return this.value;
  }

  setValue(value: GMLNodeValue) {
    this.value = value;
  }

  parseValue(data: GMLParsedNode) {
    const value = data.textContent ?? "";
    this.value =
      (typeof value === "string" ? value : "").split("\n").shift() ?? "";
  }

  parseAttributes(data: GMLParsedNode) {
    if (!Array.isArray(this.definition.attributes)) {
      return;
    }
    if ("attributes" in data && data.attributes.length) {
      for (let i = 0; i < data.attributes.length; ++i) {
        const attr = data.attributes.item(i);
        const name = attr?.nodeName.toLowerCase();
        if (attr && isGMLNodeAttribute(name)) {
          const value = attr.value;
          const attributeDefinition = this.getAttributeDefinition(name);
          if (attributeDefinition) {
            const attributeValue =
              typeof attributeDefinition.parse === "function"
                ? attributeDefinition.parse(value)
                : value;
            this.setAttribute(<GMLNodeAttribute>name, attributeValue);
          }
        }
      }
    }
  }

  parseChildNodes(data: GMLParsedNode) {
    if (data.childNodes?.length) {
      for (let i = 0; i < data.childNodes.length; ++i) {
        const child = data.childNodes[i];
        const name = child.nodeName.toLowerCase();
        if (isGMLNodeName(name)) {
          const childNode = this.getChildNodeDefinition(name);
          if (childNode) {
            const definition = getGMLNodeDefinition(name);
            this.addChild(name, createGmlNode(definition, child));
          }
        }
      }
    }
  }

  getChildNodeDefinition(
    name: GMLNodeName
  ): GMLChildNodeDefinition | undefined {
    return this.definition.children
      .map((item) =>
        typeof item === "string" ? createGMLChildNodeDefinition(item) : item
      )
      .find((item) => item.name === name);
  }

  getAttributeDefinition(
    name: GMLNodeAttribute
  ): GMLAttributeDefinition | undefined {
    return this.definition.attributes?.find((item) => item.name === name);
  }

  getTagStart() {
    return formatXmlTagStart(this.definition.name, this.attributes);
  }

  getTagEnd() {
    return formatXmlTagEnd(this.definition.name);
  }

  getTagContent() {
    return (<GMLNodeName[]>Object.keys(this.children))
      .map((child) =>
        this.children[child]?.map((item) => item.toString()).join("")
      )
      .join("");
  }

  toString() {
    return `${this.getTagStart()}${this.getTagContent()}${this.getTagEnd()}`;
  }

  toObject() {
    const obj: GMLObjectRepresentation = (<GMLNodeName[]>(
      Object.keys(this.children)
    )).reduce(
      (result, tag) => ({
        ...result,
        [tag]: (<GMLNode[]>this.children[tag]).map((item) => item.toObject()),
      }),
      {}
    );
    return obj;
  }
}
