import { GMLNode } from "../../node.ts";
import {
  type GMLAttributeDefinition,
  GMLNodeAttribute,
  type GMLNodeDefinition,
  GMLNodeName,
} from "../../types.ts";
import { GMLPoint } from "../point/index.ts";

export class GMLStroke extends GMLNode {
  isDrawing() {
    return this.getAttribute(GMLNodeAttribute.IS_DRAWING);
  }
  getPoint(index: number) {
    return this.getChild<GMLPoint>([GMLNodeName.POINT, index]);
  }
  getPoints() {
    return this.getChildren<GMLPoint>(GMLNodeName.POINT);
  }
}

const attrIsDrawing: GMLAttributeDefinition = {
  name: GMLNodeAttribute.IS_DRAWING,
  defaultValue: true,
  parse: (value) => (typeof value === "string" ? value === "true" : Boolean(value)),
  stringify: (value) => (value ? "true" : "false"),
};

export const GMLStrokeDefinition: GMLNodeDefinition = {
  name: GMLNodeName.STROKE,
  model: GMLStroke,
  attributes: [attrIsDrawing],
  children: [GMLNodeName.POINT, GMLNodeName.BRUSH, GMLNodeName.STROKE_INFO],
};

export default GMLStrokeDefinition;
