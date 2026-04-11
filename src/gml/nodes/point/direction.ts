import { type GMLNodeDefinition, GMLNodeName } from "../../types.ts";
import { GMLLeafNodeParent } from "../leaf/parent.ts";

export class GMLDirection extends GMLLeafNodeParent {}

export const GMLDirectionDefinition: GMLNodeDefinition = {
  name: GMLNodeName.DIRECTION,
  model: GMLDirection,
  attributes: [],
  children: [
    { name: GMLNodeName.POINT_X, required: true },
    { name: GMLNodeName.POINT_Y, required: true },
    GMLNodeName.POINT_Z,
  ],
};

export default GMLDirectionDefinition;
