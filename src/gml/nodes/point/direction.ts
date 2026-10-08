import { GMLNodeName } from "../../types.ts";
import { createDefinition } from "../../util/definition.ts";
import { GML3DPoint } from "./base.ts";
import { GMLPointXDefinition, GMLPointYDefinition, GMLPointZDefinition } from "./points.ts";

export const GMLDirectionDefinition = createDefinition(GMLNodeName.DIRECTION, GML3DPoint, {
  children: [
    { definition: GMLPointXDefinition, required: true },
    { definition: GMLPointYDefinition, required: true },
    GMLPointZDefinition,
  ],
});
