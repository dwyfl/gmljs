import type { GMLDrawingData } from "../../data.ts";
import { GMLNode } from "../../node.ts";
import { type GMLNodeDefinition, GMLNodeName } from "../../types.ts";
import { type GMLStroke, GMLStrokeDefinition } from "../stroke/index.ts";

export class GMLDrawing extends GMLNode {
  getStroke(index: number) {
    return this.getChild([GMLNodeName.STROKE, index]);
  }
  getStrokes(): readonly GMLStroke[] {
    return this.getChildren(GMLNodeName.STROKE) ?? [];
  }
  toData(): GMLDrawingData {
    return { strokes: this.getStrokes().map((stroke) => stroke.toData()) };
  }
}

export const GMLDrawingDefinition: GMLNodeDefinition<GMLDrawing> = {
  name: GMLNodeName.DRAWING,
  model: GMLDrawing,
  attributes: [],
  children: [GMLStrokeDefinition],
};

export default GMLDrawingDefinition;
