import type { GMLNode } from "./node.ts";
import type { GMLNodeChildPath, GMLNodeName } from "./types.ts";
import type { GMLBrush } from "./nodes/brush/index.ts";
import type {
  GMLBrushDripAmount,
  GMLBrushDripSpeed,
  GMLBrushDripVecRelativeToUp,
  GMLBrushLayerAbsolute,
  GMLBrushLayerRelative,
  GMLBrushMode,
  GMLBrushSpec,
  GMLBrushSpeedToWidthRatio,
  GMLBrushUniqueStyleId,
  GMLBrushWidth,
} from "./nodes/brush/settings.ts";
import type { GMLClient } from "./nodes/client/index.ts";
import type {
  GMLClientIp,
  GMLClientKeywords,
  GMLClientName,
  GMLClientPermalink,
  GMLClientUniqueKey,
  GMLClientUsername,
  GMLClientVersion,
  GMLLocation,
  GMLLocationLatitude,
  GMLLocationLongitude,
  GMLTime,
} from "./nodes/client/settings.ts";
import type { GMLDocument } from "./nodes/document/index.ts";
import type { GMLDrawing } from "./nodes/drawing/index.ts";
import type { GMLEnvironment } from "./nodes/environment/index.ts";
import type {
  GMLEnvAudio,
  GMLEnvBackground,
  GMLEnvOffset,
  GMLEnvOrigin,
  GMLEnvRealScale,
  GMLEnvRotation,
  GMLEnvScreenBounds,
  GMLEnvUp,
} from "./nodes/environment/settings.ts";
import type { GMLHeader } from "./nodes/header/index.ts";
import type { GMLColor, GMLColorA, GMLColorB, GMLColorG, GMLColorR } from "./nodes/point/color.ts";
import type { GMLDirection } from "./nodes/point/direction.ts";
import type { GMLPoint } from "./nodes/point/index.ts";
import type {
  GMLPointPressure,
  GMLPointRotation,
  GMLPointT,
  GMLPointTime,
  GMLPointUnit,
  GMLPointX,
  GMLPointY,
  GMLPointZ,
} from "./nodes/point/points.ts";
import type { GMLRoot } from "./nodes/root/index.ts";
import type { GMLStrokeInfoCurved } from "./nodes/stroke/curved.ts";
import type { GMLStroke } from "./nodes/stroke/index.ts";
import type { GMLStrokeInfo } from "./nodes/stroke/info.ts";
import type { GMLTag } from "./nodes/tag/index.ts";

type NodeTypes = {
  brush: GMLBrush;
  mode: GMLBrushMode;
  spec: GMLBrushSpec;
  width: GMLBrushWidth;
  speedtowidthratio: GMLBrushSpeedToWidthRatio;
  dripamnt: GMLBrushDripAmount;
  dripspeed: GMLBrushDripSpeed;
  dripvecrelativetoup: GMLBrushDripVecRelativeToUp;
  layerabsolute: GMLBrushLayerAbsolute;
  layerrelative: GMLBrushLayerRelative;
  uniquestyleid: GMLBrushUniqueStyleId;
  client: GMLClient;
  name: GMLClientName;
  version: GMLClientVersion;
  username: GMLClientUsername;
  permalink: GMLClientPermalink;
  keywords: GMLClientKeywords;
  uniquekey: GMLClientUniqueKey;
  location: GMLLocation;
  lat: GMLLocationLatitude;
  lon: GMLLocationLongitude;
  // <time> is a unix timestamp under <client> and a float under <pt>.
  time: GMLTime | GMLPointTime;
  ip: GMLClientIp;
  color: GMLColor;
  r: GMLColorR;
  g: GMLColorG;
  b: GMLColorB;
  a: GMLColorA;
  dir: GMLDirection;
  _: GMLDocument;
  drawing: GMLDrawing;
  environment: GMLEnvironment;
  offset: GMLEnvOffset;
  rotation: GMLEnvRotation;
  up: GMLEnvUp;
  screenbounds: GMLEnvScreenBounds;
  origin: GMLEnvOrigin;
  realscale: GMLEnvRealScale;
  audio: GMLEnvAudio;
  background: GMLEnvBackground;
  header: GMLHeader;
  pt: GMLPoint;
  t: GMLPointT;
  x: GMLPointX;
  y: GMLPointY;
  z: GMLPointZ;
  pres: GMLPointPressure;
  gml: GMLRoot;
  rot: GMLPointRotation;
  stroke: GMLStroke;
  info: GMLStrokeInfo;
  curved: GMLStrokeInfoCurved;
  tag: GMLTag;
  unit: GMLPointUnit;
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
