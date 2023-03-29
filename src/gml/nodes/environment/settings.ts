import { GMLNodeDefinition, GMLNodeName, GMLParsedNode } from "../../types";
import { createDefinition } from "../../util";
import { GMLLeafNode } from "../leaf";
import { GMLPoint } from "../point";

export class GMLEnvOffset extends GMLPoint {}
export const GMLEnvOffsetDefinition: GMLNodeDefinition = createDefinition(GMLNodeName.ENVIRONMENT_OFFSET, GMLEnvOffset);

export class GMLEnvRotation extends GMLPoint {}
export const GMLEnvRotationDefinition: GMLNodeDefinition = createDefinition(GMLNodeName.ENVIRONMENT_ROTATION, GMLEnvRotation);

export class GMLEnvOrigin extends GMLPoint {}
export const GMLEnvOriginDefinition: GMLNodeDefinition = createDefinition(GMLNodeName.ENVIRONMENT_ORIGIN, GMLEnvOrigin);

export class GMLEnvRealScare extends GMLPoint {}
export const GMLEnvRealScareDefinition: GMLNodeDefinition = createDefinition(GMLNodeName.ENVIRONMENT_REAL_SCALE, GMLEnvRealScare);

export class GMLEnvAudio extends GMLLeafNode {}
export const GMLEnvAudioDefinition: GMLNodeDefinition = createDefinition(GMLNodeName.ENVIRONMENT_AUDIO, GMLEnvAudio);

export class GMLEnvBackground extends GMLLeafNode {}
export const GMLEnvBackgroundDefinition: GMLNodeDefinition = createDefinition(GMLNodeName.ENVIRONMENT_BACKGROUND, GMLEnvBackground);

export class GMLEnvUp extends GMLPoint {
  init(data?: GMLParsedNode) {
    this.setValues({ x: 0.0, y: -1.0, z: 0.0 });
    super.init(data);
  }
}
export const GMLEnvUpDefinition: GMLNodeDefinition = createDefinition(GMLNodeName.ENVIRONMENT_UP, GMLEnvUp);

export class GMLEnvScreenBounds extends GMLPoint {
  init(data?: GMLParsedNode) {
    this.setValues({ x: 1920, y: 1080 });
    super.init(data);
  }
}
export const GMLEnvScreenBoundsDefinition: GMLNodeDefinition = createDefinition(GMLNodeName.ENVIRONMENT_SCREEN_BOUNDS, GMLEnvScreenBounds);
