import { GML } from "..";
import { GMLNode } from ".";
import { getGMLNodeDefinition } from "./map";
import { GMLEnvScreenBounds } from "./nodes/environment/settings";
import { GMLPoint } from "./nodes/point";
import { GMLStroke } from "./nodes/stroke";
import {
  GMLChildNodeDefinition,
  GMLNodeAttribute,
  GMLNodeConstructor,
  GMLNodeDefinition,
  GMLNodeName,
  GMLParsedNode,
} from "./types";
import { parseXml } from "../util/xml";

export function createGmlNodeFromTagName(
  tagName: GMLNodeName,
  data?: GMLParsedNode
): GMLNode {
  const definition = getGMLNodeDefinition(tagName);
  if (!definition) {
    throw new Error(`Invalid GML! "${tagName}" is not a valid GML tag.`);
  }
  return createGmlNode(definition, data);
}

export function createGmlNodeFromXml(xml: string): GMLNode {
  const xmlDocument = parseXml(xml);
  const xmlElement = xmlDocument.documentElement ?? undefined;
  const tagName = xmlElement?.tagName;
  if (!isGMLNodeName(tagName)) {
    throw new Error(`Invalid GML! "${tagName}" is not a valid GML tag.`);
  }
  return createGmlNodeFromTagName(tagName, xmlElement);
}

export function createGmlNode(
  definition: GMLNodeDefinition,
  data?: GMLParsedNode
): GMLNode {
  const { model } = definition;
  return new model(definition, data);
}

export const isGMLNodeAttribute = (value: unknown): value is GMLNodeAttribute =>
  Object.values(GMLNodeAttribute).includes(value as GMLNodeAttribute);

export const isGMLNodeName = (value: unknown): value is GMLNodeName =>
  Object.values(GMLNodeName).includes(value as GMLNodeName);

export const isGMLChildNodeDefinition = (
  value: unknown
): value is GMLChildNodeDefinition =>
  typeof value === "object" &&
  value !== null &&
  "name" in value &&
  typeof value.name === "string";

export const createGMLChildNodeDefinition = (
  name: GMLNodeName,
  options: Partial<GMLChildNodeDefinition> = {}
): GMLChildNodeDefinition => ({ name, ...options });

export const createDefinition = (
  name: GMLNodeName,
  model: GMLNodeConstructor
): GMLNodeDefinition => ({
  name,
  model,
  attributes: [],
  children: [],
});

type PointObj = { x: number; y: number; z?: number };

const createPoint = (values: PointObj): GMLPoint => {
  const point = <GMLPoint>createGmlNodeFromTagName(GMLNodeName.POINT);
  point.setValues(values);
  return point;
};

const createStroke = (points: PointObj[]): GMLStroke => {
  const stroke = <GMLStroke>createGmlNodeFromTagName(GMLNodeName.STROKE);
  points.forEach((point) =>
    stroke?.addChild(GMLNodeName.POINT, createPoint(point))
  );
  return stroke;
};

export const createGMLFromPointArrays = (
  strokes: PointObj[][] = [],
  options: { screenBounds?: { x: number; y: number } } = {}
) => {
  const gml = new GML();
  gml.doc = createGmlNodeFromTagName(GMLNodeName.DOCUMENT);
  if (options.screenBounds) {
    const screenBounds = gml.doc.getChildPath<GMLEnvScreenBounds>([
      GMLNodeName.ROOT,
      GMLNodeName.TAG,
      GMLNodeName.HEADER,
      GMLNodeName.ENVIRONMENT_SCREEN_BOUNDS,
    ]);
    screenBounds?.setValues(options.screenBounds);
  }
  const drawing = gml.doc.getChildPath<GMLEnvScreenBounds>([
    GMLNodeName.ROOT,
    GMLNodeName.TAG,
    GMLNodeName.DRAWING,
  ]);
  strokes.forEach((points) =>
    drawing?.addChild(GMLNodeName.STROKE, createStroke(points))
  );
  return gml;
};
