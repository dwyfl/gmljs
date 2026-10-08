import { GMLNode } from "../../node.ts";
import { type GMLNodeDefinition, GMLNodeName } from "../../types.ts";
import { GMLClientDefinition } from "../client/index.ts";
import { GMLEnvironmentDefinition } from "../environment/index.ts";

export class GMLHeader extends GMLNode {}

export const GMLHeaderDefinition: GMLNodeDefinition<GMLHeader> = {
  name: GMLNodeName.HEADER,
  model: GMLHeader,
  attributes: [],
  children: [GMLClientDefinition, GMLEnvironmentDefinition],
};

export default GMLHeaderDefinition;
