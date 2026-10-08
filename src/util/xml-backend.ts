// XML backend for Node and other runtimes without a DOM: @xmldom/xmldom.
// The browser build swaps this module for xml-backend.browser.ts (see vite.config.ts).
import { DOMParser, XMLSerializer } from "@xmldom/xmldom";
import type { XmlDocument, XmlNode } from "./xml.ts";

/** Parses well-formed XML; throws an Error describing the first problem otherwise. */
export const parseXmlDocument = (str: string): XmlDocument => {
  let firstProblem: string | undefined;
  // Treat warnings and errors as fatal, like browsers do. This also keeps
  // xmldom from logging them to the console.
  const parser = new DOMParser({
    onError: (level, message) => {
      firstProblem ??= message.split("\n")[0]?.trim();
      if (level !== "fatalError") {
        throw new Error(message);
      }
    },
  });
  try {
    return parser.parseFromString(str, "application/xml");
  } catch (error) {
    throw new Error(firstProblem ?? String(error), { cause: error });
  }
};

export const serializeXmlNode = (node: XmlNode): string =>
  new XMLSerializer().serializeToString(node);
