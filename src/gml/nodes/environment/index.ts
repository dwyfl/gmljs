import { GMLNode } from "../..";
import { GMLNodeDefinition, GMLNodeName } from "../../types";

export class GMLEnvironment extends GMLNode {}

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
