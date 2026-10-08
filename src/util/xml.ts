import {
  DOMParser,
  XMLSerializer,
  type Document as _XmlDocument,
  type Element as _XmlElement,
  type Node as _XmlNode,
} from "@xmldom/xmldom";
import { GMLParseError } from "../errors.ts";

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

export const serializeXml = (node: XmlNode): string => new XMLSerializer().serializeToString(node);

export const parseXml = (str: string): XmlDocument => {
  // Without an onError handler xmldom logs every problem to console.error.
  // Fatal errors still throw, everything else is tolerated.
  const parser = new DOMParser({ onError: () => {} });
  try {
    return parser.parseFromString(str, "application/xml");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new GMLParseError(`Invalid XML: ${message}`, { cause: error });
  }
};
