import { GMLNode } from "../..";
import {
  GMLAttributeDefinition,
  GMLNodeAttribute,
  GMLNodeDefinition,
  GMLNodeName,
} from "../../types";
import { GMLPoint } from "../point";

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
  parse: (value) =>
    typeof value === "string" ? value === "true" : Boolean(value),
  stringify: (value) => (value ? "true" : "false"),
};

export const GMLStrokeDefinition: GMLNodeDefinition = {
  name: GMLNodeName.STROKE,
  model: GMLStroke,
  attributes: [attrIsDrawing],
  children: [GMLNodeName.POINT, GMLNodeName.BRUSH, GMLNodeName.STROKE_INFO],
};

export default GMLStrokeDefinition;
