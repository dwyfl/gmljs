import GML from "..";
import { GMLNode } from ".";
import { getGMLNodeDefinition } from "./map";
import { GMLEnvScreenBounds } from "./nodes/environment/settings";
import { GMLPoint } from "./nodes/point";
import { GMLStroke } from "./nodes/stroke";
import { GMLChildNodeDefinition, GMLNodeAttribute, GMLNodeConstructor, GMLNodeDefinition, GMLNodeName, GMLParsedNode } from "./types";

export function createGmlNodeFromTagName(tagName: GMLNodeName, data?: GMLParsedNode): GMLNode {
  const definition = getGMLNodeDefinition(tagName);
  if (!definition) {
    throw new Error(`Invalid GML! There is no tag named "${tagName}".`);
  }
  return createGmlNode(definition, data);
}

export function createGmlNode(definition: GMLNodeDefinition, data?: GMLParsedNode): GMLNode {
  const { model } = definition;
  return new model(definition, data);
}

export const isGMLNodeAttribute = (value: any): value is GMLNodeAttribute =>
  Object.values(GMLNodeAttribute).includes(value);

export const isGMLNodeName = (value: any): value is GMLNodeName =>
  Object.values(GMLNodeName).includes(value);

export const isGMLChildNodeDefinition = (value: any): value is GMLChildNodeDefinition =>
  typeof value === 'object' && typeof value.name === 'string';

export const createGMLChildNodeDefinition = (
  name: GMLNodeName,
  options: Partial<GMLChildNodeDefinition> = {}
): GMLChildNodeDefinition =>
  ({ name, ...options });

export const createDefinition = (name: GMLNodeName, model: GMLNodeConstructor): GMLNodeDefinition => ({
  name,
  model,
  attributes: [],
  children: [],
});

type PointObj = { x: number, y: number, z?: number };

const createPoint = (values: PointObj): GMLPoint => {
  const point = <GMLPoint>createGmlNodeFromTagName(GMLNodeName.POINT);
  point.setValues(values);
  return point;
};

const createStroke = (points: PointObj[]): GMLStroke => {
  const stroke = <GMLStroke>createGmlNodeFromTagName(GMLNodeName.STROKE);
  points.forEach(point => stroke?.addChild(GMLNodeName.POINT, createPoint(point)));
  return stroke;
}

export const createGMLFromPointArrays = (
  strokes: PointObj[][] = [],
  options: { screenBounds?: { x: number, y: number } } = {}) => {
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
  strokes.forEach(
    points => drawing?.addChild(GMLNodeName.STROKE, createStroke(points))
  );
  return gml;
};
