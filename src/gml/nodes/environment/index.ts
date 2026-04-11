import { GMLNode } from "../../node.ts";
import { isNumber } from "../../../util/is-number.ts";
import { type GMLNodeDefinition, GMLNodeName } from "../../types.ts";
import { GMLEnvOffset, GMLEnvRotation, GMLEnvScreenBounds, GMLEnvUp } from "./settings.ts";

export class GMLEnvironment extends GMLNode {
  getUp() {
    return this.getChild<GMLEnvUp>(GMLNodeName.ENVIRONMENT_UP)?.getXYZ();
  }
  getScreenBounds() {
    return this.getChild<GMLEnvScreenBounds>(GMLNodeName.ENVIRONMENT_SCREEN_BOUNDS)
      ?.getXYZ()
      .filter(isNumber)
      .slice(0, 2);
  }
  getOffset() {
    return this.getChild<GMLEnvOffset>(GMLNodeName.ENVIRONMENT_OFFSET)?.getXYZ();
  }
  getRotation() {
    return this.getChild<GMLEnvRotation>(GMLNodeName.ENVIRONMENT_ROTATION)?.getXYZ();
  }
}

export const GMLEnvironmentDefinition: GMLNodeDefinition = {
  name: GMLNodeName.ENVIRONMENT,
  model: GMLEnvironment,
  attributes: [],
  children: [
    { name: GMLNodeName.ENVIRONMENT_UP, initDefault: true },
    { name: GMLNodeName.ENVIRONMENT_SCREEN_BOUNDS, initDefault: true },
    GMLNodeName.ENVIRONMENT_OFFSET,
    GMLNodeName.ENVIRONMENT_ROTATION,
    GMLNodeName.ENVIRONMENT_OFFSET,
    GMLNodeName.ENVIRONMENT_ROTATION,
    GMLNodeName.ENVIRONMENT_ORIGIN,
    GMLNodeName.ENVIRONMENT_REAL_SCALE,
    GMLNodeName.ENVIRONMENT_AUDIO,
    GMLNodeName.ENVIRONMENT_BACKGROUND,
  ],
};

export default GMLEnvironmentDefinition;
