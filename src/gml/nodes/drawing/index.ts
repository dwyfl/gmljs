import { GMLNode } from "../../node.ts";
import { type GMLNodeDefinition, GMLNodeName } from "../../types.ts";
import { GMLStroke } from "../stroke/index.ts";

export class GMLDrawing extends GMLNode {
  getStroke(index: number) {
    return this.getChildPath<GMLStroke>([[GMLNodeName.STROKE, index]]);
  }
  getStrokes(): GMLStroke[] {
    return this.getChildren<GMLStroke>(GMLNodeName.STROKE) ?? [];
  }
}

export const GMLDrawingDefinition: GMLNodeDefinition = {
  name: GMLNodeName.DRAWING,
  model: GMLDrawing,
  attributes: [],
  children: [GMLNodeName.STROKE],
};

export default GMLDrawingDefinition;
