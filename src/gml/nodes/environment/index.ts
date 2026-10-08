import { GMLNode } from "../../node.ts";
import { type GMLNodeDefinition, GMLNodeName } from "../../types.ts";

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
    { name: GMLNodeName.ENVIRONMENT_UP, initDefault: true },
    { name: GMLNodeName.ENVIRONMENT_SCREEN_BOUNDS, initDefault: true },
    GMLNodeName.ENVIRONMENT_OFFSET,
    GMLNodeName.ENVIRONMENT_ROTATION,
    GMLNodeName.ENVIRONMENT_ORIGIN,
    GMLNodeName.ENVIRONMENT_REAL_SCALE,
    GMLNodeName.ENVIRONMENT_AUDIO,
    GMLNodeName.ENVIRONMENT_BACKGROUND,
  ],
};

export default GMLEnvironmentDefinition;
