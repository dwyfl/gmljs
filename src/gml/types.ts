import type { GMLParseError } from "../errors.ts";
import type { GMLNode } from "./node.ts";
import type { XmlDocument, XmlElement, XmlNode } from "../util/xml.ts";

/**
 * Canonical (lowercased) GML tag names. Parsing is case-insensitive;
 * serialization uses the spec spelling (see `toXmlName`).
 */
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

const gmlNodeNames: ReadonlySet<string> = new Set(Object.values(GMLNodeName));
const gmlNodeAttributes: ReadonlySet<string> = new Set(Object.values(GMLNodeAttribute));

export const isGMLNodeName = (value: unknown): value is GMLNodeName =>
  typeof value === "string" && gmlNodeNames.has(value);

export const isGMLNodeAttribute = (value: unknown): value is GMLNodeAttribute =>
  typeof value === "string" && gmlNodeAttributes.has(value);

// Spec spelling of names whose canonical lowercase form differs.
const xmlNames: Partial<Record<GMLNodeName | GMLNodeAttribute, string>> = {
  speedtowidthratio: "speedToWidthRatio",
  dripamnt: "dripAmnt",
  dripspeed: "dripSpeed",
  dripvecrelativetoup: "dripVecRelativeToUp",
  layerabsolute: "layerAbsolute",
  layerrelative: "layerRelative",
  uniquestyleid: "uniqueStyleID",
  uniquekey: "uniqueKey",
  screenbounds: "screenBounds",
  realscale: "realScale",
  isdrawing: "isDrawing",
};

/** Returns the name as written in GML documents, e.g. `screenbounds` → `screenBounds`. */
export const toXmlName = (name: GMLNodeName | GMLNodeAttribute): string => xmlNames[name] ?? name;

export interface GMLNodeConstructor<T extends GMLNode = GMLNode> {
  new (definition: GMLNodeDefinition): T;
}

/** Describes a tag: its name, the class (`model`) created for it, and its allowed children. */
export type GMLNodeDefinition<T extends GMLNode = GMLNode> = {
  name: GMLNodeName;
  model: GMLNodeConstructor<T>;
  /** Allowed child nodes. The same tag name may map to different definitions under different parents. */
  children: (GMLNodeDefinition | GMLChildNodeDefinition)[];
  attributes: GMLAttributeDefinition[];
  /** Value of a leaf node created without data. */
  defaultValue?: GMLNodeValue | (() => GMLNodeValue);
  /** Child values of a `GMLLeafNodeParent` created without data. */
  defaultChildValues?: Partial<Record<GMLNodeName, GMLNodeValue>>;
};

export type GMLChildNodeDefinition = {
  definition: GMLNodeDefinition;
  required?: boolean; // if true parsing throws when the node is missing
  initDefault?: boolean; // create by default when creating a parent which supports this node
};

export type GMLNodeValue = string | number;
export type GMLNodeChildPath = GMLNodeName | readonly [GMLNodeName, number];
export type GMLNodeChildren = Partial<Record<GMLNodeName, GMLNode[]>>;

export type GMLNodeAttributeValue = string | number | boolean;
export type GMLNodeAttributes = Partial<Record<GMLNodeAttribute, GMLNodeAttributeValue>>;
export type GMLAttributeDefinition = {
  name: GMLNodeAttribute;
  required?: boolean;
  defaultValue?: GMLNodeAttributeValue;
  parse?: (value: string) => GMLNodeAttributeValue;
  stringify?: (value: GMLNodeAttributeValue) => string;
};

/** Leaf nodes become their value, other nodes a map of child name to child objects. */
export type GMLObjectRepresentation = GMLNodeValue | { [name: string]: GMLObjectRepresentation[] };

export type GMLParsedNode = XmlDocument | XmlElement | XmlNode;

export type GMLParseOptions = {
  /**
   * Throw on the first invalid element. By default invalid elements are kept
   * verbatim as GMLUnknownNode and reported through `onWarning`.
   */
  strict?: boolean;
  /** Called for each invalid element that was kept as a GMLUnknownNode. */
  onWarning?: (warning: GMLParseError) => void;
};

/** State shared by all nodes while parsing one document. */
export type GMLParseContext = {
  readonly strict: boolean;
  readonly onWarning?: ((warning: GMLParseError) => void) | undefined;
  /** Path of the element being parsed, e.g. `["gml[0]", "tag[0]"]`. */
  readonly path: string[];
};
