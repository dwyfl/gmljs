import type {
  Document as _XmlDocument,
  Element as _XmlElement,
  Node as _XmlNode,
} from "@xmldom/xmldom";
import { GMLParseError } from "../errors.ts";
import { parseXmlDocument, serializeXmlNode } from "./xml-backend.ts";

export type XmlDocument = _XmlDocument;
export type XmlElement = _XmlElement;
export type XmlNode = _XmlNode;

const XML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
};

export const escapeXmlText = (value: string) =>
  value.replace(/[&<>]/g, (char) => XML_ENTITIES[char] ?? char);

export const escapeXmlAttribute = (value: string) =>
  value.replace(/[&<>"]/g, (char) => XML_ENTITIES[char] ?? char);

export const formatXmlTagStart = (tagName: string, attributes: Record<string, string> = {}) => {
  const attrStrings = Object.entries(attributes).map(
    ([key, value]) => `${key}="${escapeXmlAttribute(value)}"`,
  );
  return `<${tagName}${attrStrings.length ? ` ${attrStrings.join(" ")}` : ""}>`;
};

export const formatXmlTagEnd = (tagName: string) => {
  return "</" + tagName + ">";
};

export const serializeXml = (node: XmlNode): string => serializeXmlNode(node);

// What may come before the root element besides a DOCTYPE: a BOM, whitespace, the XML
// declaration and other processing instructions, and comments.
const PROLOG = /^\uFEFF?(?:\s+|<\?[\s\S]*?\?>|<!--[\s\S]*?-->)*/;

export const parseXml = (str: string): XmlDocument => {
  // GML never needs a DTD. Reject it up front, so entity declarations can't expand and both
  // XML backends treat the same document the same way (browsers would otherwise accept it).
  const prolog = PROLOG.exec(str)?.[0] ?? "";
  if (str.startsWith("<!DOCTYPE", prolog.length)) {
    throw new GMLParseError("Invalid XML: DOCTYPE declarations are not supported");
  }
  try {
    return parseXmlDocument(str);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new GMLParseError(`Invalid XML: ${message}`, { cause: error });
  }
};
