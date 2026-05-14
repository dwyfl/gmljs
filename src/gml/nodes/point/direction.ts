import { type GMLNodeDefinition, GMLNodeName } from "../../types.ts";
import { GML3DPoint } from "./index.ts";

export class GMLDirection extends GML3DPoint {}

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
