import { GMLParseError } from "../../errors.ts";
import { createGmlNode, type GMLNode } from "../node.ts";
import { getGMLNodeDefinition } from "../map.ts";
import type { GMLDocument } from "../nodes/document/index.ts";
import type { GMLPoint } from "../nodes/point/index.ts";
import type { GMLRGBA } from "../nodes/point/color.ts";
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
  if (!xmlElement || !isGMLNodeName(tagName)) {
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

export type GMLFromPointsOptions = {
  screenBounds?: { x: number; y: number };
  /** Attached to the first stroke; GML has no concept of a document-wide brush. */
  brush?: { width?: number; color?: GMLRGBA };
  client?: { name?: string; version?: string };
};

const createPoint = (values: GMLPointValues): GMLPoint => {
  const point = createGmlNodeFromTagName(GMLNodeName.POINT);
  point.setValues(values);
  return point;
};

const createBrush = (brush: { width?: number; color?: GMLRGBA }) => {
  const brushNode = createGmlNodeFromTagName(GMLNodeName.BRUSH);
  if (brush.width !== undefined) {
    const width = createGmlNodeFromTagName(GMLNodeName.BRUSH_WIDTH);
    width.setValue(brush.width);
    brushNode.addChild(GMLNodeName.BRUSH_WIDTH, width);
  }
  if (brush.color) {
    const color = createGmlNodeFromTagName(GMLNodeName.COLOR);
    const [r, g, b, a] = brush.color;
    color.setValues({
      [GMLNodeName.COLOR_R]: r,
      [GMLNodeName.COLOR_G]: g,
      [GMLNodeName.COLOR_B]: b,
      [GMLNodeName.COLOR_A]: a,
    });
    brushNode.addChild(GMLNodeName.COLOR, color);
  }
  return brushNode;
};

const createStroke = (
  points: readonly GMLPointValues[],
  brush?: { width?: number; color?: GMLRGBA },
): GMLStroke => {
  const stroke = createGmlNodeFromTagName(GMLNodeName.STROKE);
  if (brush) {
    stroke.addChild(GMLNodeName.BRUSH, createBrush(brush));
  }
  points.forEach((point) => stroke.addChild(GMLNodeName.POINT, createPoint(point)));
  return stroke;
};

/** Builds a single-tag, single-drawing document with one stroke per point array. */
export const createGMLDocumentFromPointArrays = (
  strokes: readonly (readonly GMLPointValues[])[] = [],
  options: GMLFromPointsOptions = {},
): GMLDocument => {
  const doc = createGmlNodeFromTagName(GMLNodeName.DOCUMENT);
  const tag = doc.getChildPath([GMLNodeName.ROOT, GMLNodeName.TAG]);
  const drawing = tag?.getDrawing();
  if (!tag || !drawing) {
    throw new Error("Default GML document is missing <tag> or <drawing>.");
  }
  if (options.screenBounds || options.client) {
    const header = createGmlNodeFromTagName(GMLNodeName.HEADER);
    if (options.client) {
      const client = createGmlNodeFromTagName(GMLNodeName.CLIENT);
      if (options.client.name !== undefined) {
        client.getChild(GMLNodeName.CLIENT_NAME)?.setValue(options.client.name);
      }
      if (options.client.version !== undefined) {
        client.getChild(GMLNodeName.CLIENT_VERSION)?.setValue(options.client.version);
      }
      header.addChild(GMLNodeName.CLIENT, client);
    }
    if (options.screenBounds) {
      const environment = createGmlNodeFromTagName(GMLNodeName.ENVIRONMENT);
      environment.getChild(GMLNodeName.ENVIRONMENT_SCREEN_BOUNDS)?.setValues(options.screenBounds);
      header.addChild(GMLNodeName.ENVIRONMENT, environment);
    }
    // <header> goes before <drawing>, so re-append the drawing after it.
    tag.removeChild(GMLNodeName.DRAWING);
    tag.addChild(GMLNodeName.HEADER, header);
    tag.addChild(GMLNodeName.DRAWING, drawing);
  }
  strokes.forEach((points, index) =>
    drawing.addChild(
      GMLNodeName.STROKE,
      createStroke(points, index === 0 ? options.brush : undefined),
    ),
  );
  return doc;
};
