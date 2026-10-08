import { GMLNode } from "../../node.ts";
import {
  type GMLAttributeDefinition,
  GMLNodeAttribute,
  type GMLNodeDefinition,
  GMLNodeName,
} from "../../types.ts";
import type { GMLPoint } from "../point/index.ts";

export class GMLStroke extends GMLNode {
  isDrawing(): boolean {
    return this.getAttribute(GMLNodeAttribute.IS_DRAWING) !== false;
  }
  getPoint(index: number) {
    return this.getChild([GMLNodeName.POINT, index]);
  }
  getPoints(): GMLPoint[] {
    return this.getChildren(GMLNodeName.POINT) ?? [];
  }
  getBrush() {
    return this.getChild(GMLNodeName.BRUSH);
  }
}

const attrIsDrawing: GMLAttributeDefinition = {
  name: GMLNodeAttribute.IS_DRAWING,
  defaultValue: true,
  parse: (value) => value.trim().toLowerCase() !== "false",
  stringify: (value) => (value ? "true" : "false"),
};

export const GMLStrokeDefinition: GMLNodeDefinition = {
  name: GMLNodeName.STROKE,
  model: GMLStroke,
  attributes: [attrIsDrawing],
  children: [GMLNodeName.POINT, GMLNodeName.BRUSH, GMLNodeName.STROKE_INFO],
};

export default GMLStrokeDefinition;
