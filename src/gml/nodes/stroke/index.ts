import { compact, type GMLStrokeData } from "../../data.ts";
import { GMLNode } from "../../node.ts";
import {
  type GMLAttributeDefinition,
  GMLNodeAttribute,
  type GMLNodeDefinition,
  GMLNodeName,
} from "../../types.ts";
import { type GMLPoint, GMLPointDefinition } from "../point/index.ts";
import { GMLBrushDefinition } from "../brush/index.ts";
import { GMLStrokeInfoDefinition } from "./info.ts";

export class GMLStroke extends GMLNode {
  isDrawing(): boolean {
    return this.getAttribute(GMLNodeAttribute.IS_DRAWING) !== false;
  }
  getPoint(index: number) {
    return this.getChild([GMLNodeName.POINT, index]);
  }
  getPoints(): readonly GMLPoint[] {
    return this.getChildren(GMLNodeName.POINT) ?? [];
  }
  getBrush() {
    return this.getChild(GMLNodeName.BRUSH);
  }
  toData(): GMLStrokeData {
    return compact({
      isDrawing: this.isDrawing(),
      brush: this.getBrush()?.toData(),
      points: this.getPoints().map((point) => point.toData()),
    });
  }
}

const attrIsDrawing: GMLAttributeDefinition = {
  name: GMLNodeAttribute.IS_DRAWING,
  defaultValue: true,
  parse: (value) => value.trim().toLowerCase() !== "false",
  stringify: (value) => (value ? "true" : "false"),
};

export const GMLStrokeDefinition: GMLNodeDefinition<GMLStroke> = {
  name: GMLNodeName.STROKE,
  model: GMLStroke,
  attributes: [attrIsDrawing],
  children: [GMLPointDefinition, GMLBrushDefinition, GMLStrokeInfoDefinition],
};

export default GMLStrokeDefinition;
