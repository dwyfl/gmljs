import { GMLNode } from "../../node.ts";
import { type GMLNodeDefinition, GMLNodeName } from "../../types.ts";

export class GMLHeader extends GMLNode {}

export const GMLHeaderDefinition: GMLNodeDefinition = {
  name: GMLNodeName.HEADER,
  model: GMLHeader,
  attributes: [],
  children: [GMLNodeName.CLIENT, GMLNodeName.ENVIRONMENT],
};

export default GMLHeaderDefinition;
