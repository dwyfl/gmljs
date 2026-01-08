import {
  GMLNodeConstructor,
  GMLNodeDefinition,
  GMLNodeName,
  GMLParsedNode,
} from "../../types";
import { createDefinition } from "../../util/definition";
import { GMLLeafNode } from "../leaf";
import GMLPointDefinition, { GMLPoint } from "../point";

export const createGMLPointDefinition = (
  name: GMLNodeName,
  model: GMLNodeConstructor
): GMLNodeDefinition => ({
  ...GMLPointDefinition,
  name,
  model,
});

export class GMLEnvOffset extends GMLPoint {}
export const GMLEnvOffsetDefinition: GMLNodeDefinition =
  createGMLPointDefinition(GMLNodeName.ENVIRONMENT_OFFSET, GMLEnvOffset);

export class GMLEnvRotation extends GMLPoint {}
export const GMLEnvRotationDefinition: GMLNodeDefinition =
  createGMLPointDefinition(GMLNodeName.ENVIRONMENT_ROTATION, GMLEnvRotation);

export class GMLEnvOrigin extends GMLPoint {}
export const GMLEnvOriginDefinition: GMLNodeDefinition =
  createGMLPointDefinition(GMLNodeName.ENVIRONMENT_ORIGIN, GMLEnvOrigin);

export class GMLEnvRealScare extends GMLPoint {}
export const GMLEnvRealScareDefinition: GMLNodeDefinition =
  createGMLPointDefinition(GMLNodeName.ENVIRONMENT_REAL_SCALE, GMLEnvRealScare);

export class GMLEnvAudio extends GMLLeafNode {}
export const GMLEnvAudioDefinition: GMLNodeDefinition = createDefinition(
  GMLNodeName.ENVIRONMENT_AUDIO,
  GMLEnvAudio
);

export class GMLEnvBackground extends GMLLeafNode {}
export const GMLEnvBackgroundDefinition: GMLNodeDefinition = createDefinition(
  GMLNodeName.ENVIRONMENT_BACKGROUND,
  GMLEnvBackground
);

export class GMLEnvUp extends GMLPoint {
  init(data?: GMLParsedNode) {
    super.init(data, { x: 0, y: -1, z: 0 });
  }
}
export const GMLEnvUpDefinition: GMLNodeDefinition = createGMLPointDefinition(
  GMLNodeName.ENVIRONMENT_UP,
  GMLEnvUp
);

export class GMLEnvScreenBounds extends GMLPoint {
  init(data?: GMLParsedNode) {
    super.init(data, { x: 1920, y: 1080 });
  }
}
export const GMLEnvScreenBoundsDefinition: GMLNodeDefinition =
  createGMLPointDefinition(
    GMLNodeName.ENVIRONMENT_SCREEN_BOUNDS,
    GMLEnvScreenBounds
  );
