import { GMLNode } from "../..";
import { GMLNodeDefinition, GMLNodeName } from "../../types";

export class GMLBrush extends GMLNode {}

export const GMLBrushDefinition: GMLNodeDefinition = {
  name: GMLNodeName.BRUSH,
  model: GMLBrush,
  attributes: [],
  children: [
    GMLNodeName.COLOR,
    GMLNodeName.BRUSH_MODE,
    GMLNodeName.BRUSH_SPEC,
    GMLNodeName.BRUSH_WIDTH,
    GMLNodeName.BRUSH_SPEED_TO_WIDTH_RATIO,
    GMLNodeName.BRUSH_DRIP_AMOUNT,
    GMLNodeName.BRUSH_DRIP_SPEED,
    GMLNodeName.BRUSH_DRIP_VEC_RELATIVE_TO_UP,
    GMLNodeName.BRUSH_LAYER_ABSOLUTE,
    GMLNodeName.BRUSH_LAYER_RELATIVE,
    GMLNodeName.BRUSH_UNIQUE_STYLE_ID,
  ],
};

export default GMLBrushDefinition;
