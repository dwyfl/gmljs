// XML backend for browsers: the built-in DOMParser and XMLSerializer.
// Used by the browser build in place of xml-backend.ts (see vite.config.ts).
import type { XmlDocument, XmlNode } from "./xml.ts";

// The library is compiled without DOM types, so describe the parts used here.
type NativeElement = { namespaceURI: string | null; textContent: string | null };
type NativeDocument = {
  getElementsByTagNameNS(namespace: string | null, name: string): ArrayLike<NativeElement>;
};
type NativeDOM = {
  DOMParser: new () => { parseFromString(source: string, type: string): NativeDocument };
  XMLSerializer: new () => { serializeToString(node: unknown): string };
};

const dom = () => {
  const { DOMParser, XMLSerializer } = globalThis as unknown as Partial<NativeDOM>;
  if (!DOMParser || !XMLSerializer) {
    throw new Error("gmljs: this build needs a browser with DOMParser and XMLSerializer.");
  }
  return { DOMParser, XMLSerializer };
};

// Browsers report errors by inserting a <parsererror> element, whose namespace
// differs between engines. Find it by parsing something invalid.
let parserErrorNamespace: string | null | undefined;
const getParserErrorNamespace = (parser: InstanceType<NativeDOM["DOMParser"]>) => {
  if (parserErrorNamespace === undefined) {
    const invalid = parser.parseFromString("<", "application/xml");
    parserErrorNamespace =
      invalid.getElementsByTagNameNS("*", "parsererror")[0]?.namespaceURI ?? null;
  }
  return parserErrorNamespace;
};

/** Parses well-formed XML; throws an Error describing the first problem otherwise. */
export const parseXmlDocument = (str: string): XmlDocument => {
  const parser = new (dom().DOMParser)();
  const doc = parser.parseFromString(str, "application/xml");
  const error = doc.getElementsByTagNameNS(getParserErrorNamespace(parser), "parsererror")[0];
  if (error) {
    throw new Error(error.textContent?.replace(/\s+/g, " ").trim() || "Unknown XML error");
  }
  return doc as unknown as XmlDocument;
};

export const serializeXmlNode = (node: XmlNode): string =>
  new (dom().XMLSerializer)().serializeToString(node);
