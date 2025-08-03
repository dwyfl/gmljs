import { GMLNode } from "../..";
import { GMLNodeDefinition, GMLNodeName } from "../../types";

export class GMLHeader extends GMLNode {}

export const GMLHeaderDefinition: GMLNodeDefinition = {
  name: GMLNodeName.HEADER,
  model: GMLHeader,
  attributes: [],
  children: [GMLNodeName.CLIENT, GMLNodeName.ENVIRONMENT],
};

export default GMLHeaderDefinition;
