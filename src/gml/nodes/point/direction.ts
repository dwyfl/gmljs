import { type GMLNodeDefinition, GMLNodeName } from "../../types.ts";
import { GML3DPoint } from "./base.ts";
import { GMLPointXDefinition, GMLPointYDefinition, GMLPointZDefinition } from "./points.ts";

export class GMLDirection extends GML3DPoint {}

export const GMLDirectionDefinition: GMLNodeDefinition = {
  name: GMLNodeName.DIRECTION,
  model: GMLDirection,
  attributes: [],
  children: [
    { definition: GMLPointXDefinition, required: true },
    { definition: GMLPointYDefinition, required: true },
    GMLPointZDefinition,
  ],
};
