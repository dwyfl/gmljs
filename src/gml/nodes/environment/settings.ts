import {
  type GMLNodeConstructor,
  type GMLNodeDefinition,
  GMLNodeName,
  type GMLParsedNode,
} from "../../types.ts";
import { createDefinition } from "../../util/definition.ts";
import { GMLLeafNode } from "../leaf/index.ts";
import { GML3DPoint } from "../point/base.ts";
import { GMLPointDefinition } from "../point/index.ts";

export const createGMLPointDefinition = (
  name: GMLNodeName,
  model: GMLNodeConstructor,
): GMLNodeDefinition => ({
  ...GMLPointDefinition,
  name,
  model,
});

export class GMLEnvOffset extends GML3DPoint {}
export const GMLEnvOffsetDefinition: GMLNodeDefinition = createGMLPointDefinition(
  GMLNodeName.ENVIRONMENT_OFFSET,
  GMLEnvOffset,
);

export class GMLEnvRotation extends GML3DPoint {}
export const GMLEnvRotationDefinition: GMLNodeDefinition = createGMLPointDefinition(
  GMLNodeName.ENVIRONMENT_ROTATION,
  GMLEnvRotation,
);

export class GMLEnvOrigin extends GML3DPoint {}
export const GMLEnvOriginDefinition: GMLNodeDefinition = createGMLPointDefinition(
  GMLNodeName.ENVIRONMENT_ORIGIN,
  GMLEnvOrigin,
);

export class GMLEnvRealScale extends GML3DPoint {}
export const GMLEnvRealScaleDefinition: GMLNodeDefinition = createGMLPointDefinition(
  GMLNodeName.ENVIRONMENT_REAL_SCALE,
  GMLEnvRealScale,
);

export class GMLEnvAudio extends GMLLeafNode {}
export const GMLEnvAudioDefinition: GMLNodeDefinition = createDefinition(
  GMLNodeName.ENVIRONMENT_AUDIO,
  GMLEnvAudio,
);

export class GMLEnvBackground extends GMLLeafNode {}
export const GMLEnvBackgroundDefinition: GMLNodeDefinition = createDefinition(
  GMLNodeName.ENVIRONMENT_BACKGROUND,
  GMLEnvBackground,
);

export class GMLEnvUp extends GML3DPoint {
  override init(data?: GMLParsedNode) {
    super.init(data, { x: 0, y: -1, z: 0 });
  }
}
export const GMLEnvUpDefinition: GMLNodeDefinition = createGMLPointDefinition(
  GMLNodeName.ENVIRONMENT_UP,
  GMLEnvUp,
);

export class GMLEnvScreenBounds extends GML3DPoint {
  override init(data?: GMLParsedNode) {
    super.init(data, { x: 1920, y: 1080 });
  }
}
export const GMLEnvScreenBoundsDefinition: GMLNodeDefinition = createGMLPointDefinition(
  GMLNodeName.ENVIRONMENT_SCREEN_BOUNDS,
  GMLEnvScreenBounds,
);
