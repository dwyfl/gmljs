import type { GMLNode } from "./node.ts";
import type { GMLNodeChildPath, GMLNodeName } from "./types.ts";
import type { GMLBrush } from "./nodes/brush/index.ts";
import type { GMLClient } from "./nodes/client/index.ts";
import type { GMLDocument } from "./nodes/document/index.ts";
import type { GMLDrawing } from "./nodes/drawing/index.ts";
import type { GMLEnvironment } from "./nodes/environment/index.ts";
import type { GMLHeader } from "./nodes/header/index.ts";
import type { GMLFloatNode } from "./nodes/leaf/float.ts";
import type { GMLLeafNode } from "./nodes/leaf/index.ts";
import type { GMLIntegerNode } from "./nodes/leaf/integer.ts";
import type { GMLLeafNodeParent } from "./nodes/leaf/parent.ts";
import type { GML3DPoint } from "./nodes/point/base.ts";
import type { GMLColor } from "./nodes/point/color.ts";
import type { GMLPoint } from "./nodes/point/index.ts";
import type { GMLRoot } from "./nodes/root/index.ts";
import type { GMLStroke } from "./nodes/stroke/index.ts";
import type { GMLTag } from "./nodes/tag/index.ts";

type NodeTypes = {
  brush: GMLBrush;
  mode: GMLLeafNode;
  spec: GMLLeafNode;
  width: GMLFloatNode;
  speedtowidthratio: GMLFloatNode;
  dripamnt: GMLFloatNode;
  dripspeed: GMLFloatNode;
  dripvecrelativetoup: GML3DPoint;
  layerabsolute: GMLIntegerNode;
  layerrelative: GMLIntegerNode;
  uniquestyleid: GMLLeafNode;
  client: GMLClient;
  name: GMLLeafNode;
  version: GMLLeafNode;
  username: GMLLeafNode;
  permalink: GMLLeafNode;
  keywords: GMLLeafNode;
  uniquekey: GMLLeafNode;
  location: GMLLeafNodeParent;
  lat: GMLFloatNode;
  lon: GMLFloatNode;
  // <time> is a unix timestamp under <client> and a float under <pt>.
  time: GMLIntegerNode | GMLFloatNode;
  ip: GMLLeafNode;
  color: GMLColor;
  r: GMLFloatNode;
  g: GMLFloatNode;
  b: GMLFloatNode;
  a: GMLFloatNode;
  dir: GML3DPoint;
  "#document": GMLDocument;
  drawing: GMLDrawing;
  environment: GMLEnvironment;
  offset: GML3DPoint;
  rotation: GML3DPoint;
  up: GML3DPoint;
  screenbounds: GML3DPoint;
  origin: GML3DPoint;
  realscale: GML3DPoint;
  audio: GMLLeafNode;
  background: GMLLeafNode;
  header: GMLHeader;
  pt: GMLPoint;
  t: GMLFloatNode;
  x: GMLFloatNode;
  y: GMLFloatNode;
  z: GMLFloatNode;
  pres: GMLFloatNode;
  gml: GMLRoot;
  rot: GMLFloatNode;
  stroke: GMLStroke;
  info: GMLLeafNodeParent;
  curved: GMLLeafNode;
  tag: GMLTag;
  unit: GMLLeafNode;
};

/**
 * Maps each tag name to the node class created for it.
 * Indexing `NodeTypes[N]` fails to compile if a name is missing.
 */
export type GMLNodeTypeMap = { [N in GMLNodeName]: NodeTypes[N] };

type NameOf<S> = S extends readonly [infer N, number] ? N : S;

/** The node type found at the end of a `getChildPath()` path. */
export type GMLNodeAtPath<P extends readonly GMLNodeChildPath[]> = P extends readonly [
  ...unknown[],
  infer Last,
]
  ? NameOf<Last> extends GMLNodeName
    ? GMLNodeTypeMap[NameOf<Last>]
    : GMLNode
  : GMLNode;
