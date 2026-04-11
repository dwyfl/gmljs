import type { XmlDocument, XmlElement, XmlNode } from "../util/xml.ts";

export const GMLNodeName = {
  BRUSH: "brush",
  BRUSH_MODE: "mode",
  BRUSH_SPEC: "spec",
  BRUSH_WIDTH: "width",
  BRUSH_SPEED_TO_WIDTH_RATIO: "speedtowidthratio",
  BRUSH_DRIP_AMOUNT: "dripamnt",
  BRUSH_DRIP_SPEED: "dripspeed",
  BRUSH_DRIP_VEC_RELATIVE_TO_UP: "dripvecrelativetoup",
  BRUSH_LAYER_ABSOLUTE: "layerabsolute",
  BRUSH_LAYER_RELATIVE: "layerrelative",
  BRUSH_UNIQUE_STYLE_ID: "uniquestyleid",
  CLIENT: "client",
  CLIENT_NAME: "name",
  CLIENT_VERSION: "version",
  CLIENT_USERNAME: "username",
  CLIENT_PERMALINK: "permalink",
  CLIENT_KEYWORDS: "keywords",
  CLIENT_UNIQUEKEY: "uniquekey",
  CLIENT_LOCATION: "location",
  CLIENT_LOCATION_LAT: "lat",
  CLIENT_LOCATION_LON: "lon",
  CLIENT_TIME: "time",
  CLIENT_IP: "ip",
  COLOR: "color",
  COLOR_R: "r",
  COLOR_G: "g",
  COLOR_B: "b",
  COLOR_A: "a",
  DIRECTION: "dir",
  DOCUMENT: "_", // TODO: fix naming
  DRAWING: "drawing",
  ENVIRONMENT: "environment",
  ENVIRONMENT_OFFSET: "offset",
  ENVIRONMENT_ROTATION: "rotation",
  ENVIRONMENT_UP: "up",
  ENVIRONMENT_SCREEN_BOUNDS: "screenbounds",
  ENVIRONMENT_ORIGIN: "origin",
  ENVIRONMENT_REAL_SCALE: "realscale",
  ENVIRONMENT_AUDIO: "audio",
  ENVIRONMENT_BACKGROUND: "background",
  HEADER: "header",
  POINT: "pt",
  POINT_T: "t",
  POINT_TIME: "time",
  POINT_X: "x",
  POINT_Y: "y",
  POINT_Z: "z",
  PRESSURE: "pres",
  ROOT: "gml",
  ROTATION: "rot",
  STROKE: "stroke",
  STROKE_INFO: "info",
  STROKE_INFO_CURVED: "curved",
  TAG: "tag",
  UNIT: "unit",
} as const;

export type GMLNodeName = (typeof GMLNodeName)[keyof typeof GMLNodeName];

export const GMLNodeAttribute = {
  IS_DRAWING: "isdrawing",
  SPEC: "spec",
} as const;

export type GMLNodeAttribute = (typeof GMLNodeAttribute)[keyof typeof GMLNodeAttribute];

export interface GMLNodeConstructor {
  new (definition: GMLNodeDefinition, data?: GMLParsedNode): GMLNodeInterface;
}
export interface GMLNodeInterface {
  definition: GMLNodeDefinition;
  attributes: GMLNodeAttributes;
  children: GMLNodeChildren;
  value: GMLNodeValue;
  init(data?: GMLParsedNode): void;
  verifyAttributes(): void;
  verifyChildren(): void;
  setAttribute(key: GMLNodeAttribute, value: GMLNodeAttributeValue): void;
  getAttribute(key: GMLNodeAttribute): GMLNodeAttributeValue | undefined;
  addChild(name: GMLNodeName, child: GMLNodeInterface): void;
  removeChild(name: GMLNodeName, index?: number): void;
  hasChild(name: GMLNodeName): boolean;
  hasChildren(): boolean;
  getChild<T extends GMLNodeInterface>(child: GMLNodeChildPath): T | undefined;
  getChildren<T extends GMLNodeInterface>(name: GMLNodeName): T[] | undefined;
  getChildPath<T extends GMLNodeInterface>(path: GMLNodeChildPath[]): T | undefined;
  getChildValue(path: GMLNodeChildPath[]): GMLNodeValue | undefined;
  getChildValueString(path: GMLNodeChildPath[]): string;
  getValue(): GMLNodeValue;
  setValue(value: GMLNodeValue): void;
  parseValue(data: GMLParsedNode): void;
  parseAttributes(data: GMLParsedNode): void;
  parseChildNodes(data: GMLParsedNode): void;
  getChildNodeDefinition(name: GMLNodeName): GMLChildNodeDefinition | undefined;
  getAttributeDefinition(name: GMLNodeAttribute): GMLAttributeDefinition | undefined;
  getTagStart(): string;
  getTagEnd(): string;
  getTagContent(): string;
  toObject(): GMLObjectRepresentation;
}

export type GMLNodeDefinition = {
  name: GMLNodeName;
  model: GMLNodeConstructor;
  children: (GMLNodeName | GMLChildNodeDefinition)[];
  attributes: GMLAttributeDefinition[];
};

export type GMLChildNodeDefinition = {
  name: GMLNodeName;
  required?: boolean; // if true parser will throw error if node is missing when using strict parsing
  initDefault?: boolean; // create by default when creating a parent which supports this node
};

export type GMLNodeValue = string | number;
export type GMLNodeChildPath = GMLNodeName | [GMLNodeName, number];
export type GMLNodeChildren = Partial<Record<GMLNodeName, GMLNodeInterface[]>>;

export type GMLNodeAttributeValue = string | number | boolean;
export type GMLNodeAttributes = Partial<Record<GMLNodeAttribute, GMLNodeAttributeValue>>;
export type GMLAttributeDefinition = {
  name: GMLNodeAttribute;
  required?: boolean;
  defaultValue?: GMLNodeAttributeValue;
  parse?: (value: string) => GMLNodeAttributeValue;
  stringify?: (value: GMLNodeAttributeValue) => string;
};

type GMLObjectOrValue = GMLNodeValue | GMLObjectRepresentation;
export interface GMLObjectRepresentation extends Record<string, GMLObjectOrValue[]> {}

export type GMLParsedNode = XmlDocument | XmlElement | XmlNode;
