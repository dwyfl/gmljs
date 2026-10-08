import { type GMLNodeDefinition, GMLNodeName, type GMLNodeValue } from "../../types.ts";
import { createDefinition } from "../../util/definition.ts";
import { GMLLeafNode } from "../leaf/index.ts";
import { GML3DPoint } from "../point/base.ts";
import { GMLPointDefinition } from "../point/index.ts";

export const createGMLPointDefinition = (
  name: GMLNodeName,
  defaultChildValues?: Partial<Record<GMLNodeName, GMLNodeValue>>,
): GMLNodeDefinition<GML3DPoint> => ({
  ...GMLPointDefinition,
  name,
  model: GML3DPoint,
  ...(defaultChildValues && { defaultChildValues }),
});

export const GMLEnvOffsetDefinition = createGMLPointDefinition(GMLNodeName.ENVIRONMENT_OFFSET);
export const GMLEnvRotationDefinition = createGMLPointDefinition(GMLNodeName.ENVIRONMENT_ROTATION);
export const GMLEnvOriginDefinition = createGMLPointDefinition(GMLNodeName.ENVIRONMENT_ORIGIN);
export const GMLEnvRealScaleDefinition = createGMLPointDefinition(
  GMLNodeName.ENVIRONMENT_REAL_SCALE,
);
export const GMLEnvUpDefinition = createGMLPointDefinition(GMLNodeName.ENVIRONMENT_UP, {
  x: 0,
  y: -1,
  z: 0,
});
export const GMLEnvScreenBoundsDefinition = createGMLPointDefinition(
  GMLNodeName.ENVIRONMENT_SCREEN_BOUNDS,
  { x: 1920, y: 1080 },
);
export const GMLEnvAudioDefinition = createDefinition(GMLNodeName.ENVIRONMENT_AUDIO, GMLLeafNode);
export const GMLEnvBackgroundDefinition = createDefinition(
  GMLNodeName.ENVIRONMENT_BACKGROUND,
  GMLLeafNode,
);
