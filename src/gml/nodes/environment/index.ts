import { GMLNode } from "../../node.ts";
import { type GMLNodeDefinition, GMLNodeName } from "../../types.ts";
import {
  GMLEnvAudioDefinition,
  GMLEnvBackgroundDefinition,
  GMLEnvOffsetDefinition,
  GMLEnvOriginDefinition,
  GMLEnvRealScaleDefinition,
  GMLEnvRotationDefinition,
  GMLEnvScreenBoundsDefinition,
  GMLEnvUpDefinition,
} from "./settings.ts";

export class GMLEnvironment extends GMLNode {
  getUp() {
    return this.getChild(GMLNodeName.ENVIRONMENT_UP)?.getXYZ();
  }
  getScreenBounds(): [width: number, height: number] | undefined {
    const bounds = this.getChild(GMLNodeName.ENVIRONMENT_SCREEN_BOUNDS)?.getXYZ();
    return bounds && [bounds[0], bounds[1]];
  }
  getOffset() {
    return this.getChild(GMLNodeName.ENVIRONMENT_OFFSET)?.getXYZ();
  }
  getRotation() {
    return this.getChild(GMLNodeName.ENVIRONMENT_ROTATION)?.getXYZ();
  }
}

export const GMLEnvironmentDefinition: GMLNodeDefinition = {
  name: GMLNodeName.ENVIRONMENT,
  model: GMLEnvironment,
  attributes: [],
  children: [
    { definition: GMLEnvUpDefinition, initDefault: true },
    { definition: GMLEnvScreenBoundsDefinition, initDefault: true },
    GMLEnvOffsetDefinition,
    GMLEnvRotationDefinition,
    GMLEnvOriginDefinition,
    GMLEnvRealScaleDefinition,
    GMLEnvAudioDefinition,
    GMLEnvBackgroundDefinition,
  ],
};

export default GMLEnvironmentDefinition;
