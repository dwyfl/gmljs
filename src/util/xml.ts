import {
  DOMParser,
  type Document as _XmlDocument,
  type Element as _XmlElement,
} from "@xmldom/xmldom";

export type XmlDocument = _XmlDocument;
export type XmlElement = _XmlElement;

export type XmlValue = string | number | boolean;
export type XmlKey = string;
export type XmlTagName = string;
interface XmlObject<T> {
  [key: XmlKey]: T;
}
export type XmlAttributes = XmlObject<XmlValue>;
export type XmlTree = XmlObject<XmlTree | XmlValue>;

export const isXmlTree = (value: any): value is XmlTree =>
  typeof value === "object";
export const isXmlValue = (value: any): value is XmlValue =>
  ["string", "number", "boolean"].includes(typeof value);

export const formatXmlTagStart = (
  tagName: string,
  attributes: XmlAttributes = {}
) => {
  const attrStrings = Object.entries(attributes).map(
    ([key, value]) => `${key}="${value}"`
  );
  return `<${tagName}${attrStrings.length ? ` ${attrStrings.join(" ")}` : ""}>`;
};

export const formatXmlTagEnd = (tagName: string) => {
  return "</" + tagName + ">";
};

export const leafNodeToXml = (tagName: XmlTagName, value: XmlValue): string =>
  `${formatXmlTagStart(tagName)}${value}${formatXmlTagEnd(tagName)}`;

export const objectToXml = (obj: XmlTree, objName: string): string =>
  [
    formatXmlTagStart(objName),
    Object.keys(obj).map((key) => {
      const node = obj[key];
      return isXmlTree(node)
        ? objectToXml(node, key)
        : leafNodeToXml(key, node);
    }),
    formatXmlTagEnd(objName),
  ].join("");

// export const createNodeFromXml = (nodeType, xmlStr) => {
//   const xmlDocument = this.parseXml(xmlStr);
//   return nodeType.create(xmlDocument.documentElement);
// }

export const parseXml = (str: string) => {
  var parser = new DOMParser();
  var doc = parser.parseFromString(str, "application/xml");
  if (parserHadError(doc)) {
    throw new Error("Unable to parse GML!");
  }
  return doc;
};

const parserHadError = (doc: XmlDocument) => {
  const parserError = doc.getElementsByTagName("parsererror");
  const parsererrorNS = parserError.length ? parserError[0].namespaceURI : null;
  if (parsererrorNS === "http://www.w3.org/1999/xhtml") {
    // In PhantomJS the parseerror element doesn't seem to have a special namespace
    // Stolen from: http://stackoverflow.com/questions/11563554/how-do-i-detect-xml-parsing-errors-when-using-javascripts-domparser-in-a-cross
    return doc.getElementsByTagName("parsererror").length > 0;
  }
  return doc.getElementsByTagNameNS(parsererrorNS, "parsererror").length > 0;
};
