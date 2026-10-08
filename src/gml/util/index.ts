import { GMLParseError } from "../../errors.ts";
import { createGmlNode, type GMLNode } from "../node.ts";
import { getGMLNodeDefinition } from "../map.ts";
import type { GMLDocument } from "../nodes/document/index.ts";
import type { GMLPoint } from "../nodes/point/index.ts";
import type { GMLStroke } from "../nodes/stroke/index.ts";
import type { GMLNodeTypeMap } from "../type-map.ts";
import { GMLNodeName, type GMLParsedNode, type GMLParseOptions, isGMLNodeName } from "../types.ts";
import { parseXml } from "../../util/xml.ts";

export function createGmlNodeFromTagName<N extends GMLNodeName>(
  tagName: N,
  data?: GMLParsedNode,
  options?: GMLParseOptions,
): GMLNodeTypeMap[N] {
  const definition = getGMLNodeDefinition(tagName);
  if (!definition) {
    throw new Error(`Invalid GML! "${tagName}" is not a valid GML tag.`);
  }
  return createGmlNode(definition, data, options);
}

/**
 * Parses an XML fragment whose root element is any GML node, e.g. `<brush>…</brush>`.
 * Errors in the root element itself always throw.
 */
export function createGmlNodeFromXml(xml: string, options?: GMLParseOptions): GMLNode {
  const xmlElement = parseXml(xml).documentElement ?? undefined;
  const tagName = xmlElement?.nodeName.toLowerCase();
  if (!xmlElement || !isGMLNodeName(tagName) || tagName === GMLNodeName.DOCUMENT) {
    throw new GMLParseError(`Invalid GML! "${xmlElement?.nodeName}" is not a valid GML tag.`);
  }
  return createGmlNodeFromTagName(tagName, xmlElement, options);
}

/**
 * Parses a complete GML document. The root element must be `<gml>`.
 * Unless `strict` is set, invalid elements are kept as GMLUnknownNode and
 * listed in the document's `warnings`.
 */
export function parseGML(xml: string, options: GMLParseOptions = {}): GMLDocument {
  const xmlDocument = parseXml(xml);
  const rootName = xmlDocument.documentElement?.nodeName;
  if (rootName?.toLowerCase() !== GMLNodeName.ROOT) {
    throw new GMLParseError(`Invalid GML! Expected a <gml> root element, found <${rootName}>.`);
  }
  const warnings: GMLParseError[] = [];
  const doc = createGmlNodeFromTagName(GMLNodeName.DOCUMENT, xmlDocument, {
    ...options,
    onWarning: (warning) => {
      warnings.push(warning);
      options.onWarning?.(warning);
    },
  });
  doc.warnings = warnings;
  return doc;
}

export { createGmlNode };

export type GMLPointValues = { x: number; y: number; z?: number; t?: number };

const createPoint = (values: GMLPointValues): GMLPoint => {
  const point = createGmlNodeFromTagName(GMLNodeName.POINT);
  point.setValues(values);
  return point;
};

const createStroke = (points: GMLPointValues[]): GMLStroke => {
  const stroke = createGmlNodeFromTagName(GMLNodeName.STROKE);
  points.forEach((point) => stroke.addChild(GMLNodeName.POINT, createPoint(point)));
  return stroke;
};

/** Builds a single-tag, single-drawing document with one stroke per point array. */
export const createGMLDocumentFromPointArrays = (
  strokes: GMLPointValues[][] = [],
  options: { screenBounds?: { x: number; y: number } } = {},
): GMLDocument => {
  const doc = createGmlNodeFromTagName(GMLNodeName.DOCUMENT);
  const tag = doc.getChildPath([GMLNodeName.ROOT, GMLNodeName.TAG]);
  const drawing = tag?.getDrawing();
  if (!tag || !drawing) {
    throw new Error("Default GML document is missing <tag> or <drawing>.");
  }
  if (options.screenBounds) {
    const environment = createGmlNodeFromTagName(GMLNodeName.ENVIRONMENT);
    environment.getChild(GMLNodeName.ENVIRONMENT_SCREEN_BOUNDS)?.setValues(options.screenBounds);
    const header = createGmlNodeFromTagName(GMLNodeName.HEADER);
    header.addChild(GMLNodeName.ENVIRONMENT, environment);
    // <header> goes before <drawing>, so re-append the drawing after it.
    tag.removeChild(GMLNodeName.DRAWING);
    tag.addChild(GMLNodeName.HEADER, header);
    tag.addChild(GMLNodeName.DRAWING, drawing);
  }
  strokes.forEach((points) => drawing.addChild(GMLNodeName.STROKE, createStroke(points)));
  return doc;
};
