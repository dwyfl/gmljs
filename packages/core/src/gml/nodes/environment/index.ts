import { compact, type GMLEnvironmentData } from "../../data.ts";
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
  toData(): GMLEnvironmentData {
    const text = (name: GMLNodeName) => {
      const value = this.getChildValue([name]);
      return value === undefined ? undefined : String(value);
    };
    return compact({
      screenBounds: this.getScreenBounds(),
      up: this.getUp(),
      offset: this.getOffset(),
      rotation: this.getRotation(),
      origin: this.getChild(GMLNodeName.ENVIRONMENT_ORIGIN)?.getXYZ(),
      realScale: this.getChild(GMLNodeName.ENVIRONMENT_REAL_SCALE)?.getXYZ(),
      audio: text(GMLNodeName.ENVIRONMENT_AUDIO),
      background: text(GMLNodeName.ENVIRONMENT_BACKGROUND),
    });
  }
}

export const GMLEnvironmentDefinition: GMLNodeDefinition<GMLEnvironment> = {
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
