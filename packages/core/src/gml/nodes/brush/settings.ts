import { type GMLNodeDefinition, GMLNodeName } from "../../types.ts";
import { createDefinition } from "../../util/definition.ts";
import { GMLLeafNode } from "../leaf/index.ts";
import { GMLFloatNode } from "../leaf/float.ts";
import { GMLIntegerNode } from "../leaf/integer.ts";
import type { GML3DPoint } from "../point/base.ts";
import { GMLDirectionDefinition } from "../point/direction.ts";

export const GMLBrushModeDefinition = createDefinition(GMLNodeName.BRUSH_MODE, GMLLeafNode);
export const GMLBrushSpecDefinition = createDefinition(GMLNodeName.BRUSH_SPEC, GMLLeafNode);
export const GMLBrushWidthDefinition = createDefinition(GMLNodeName.BRUSH_WIDTH, GMLFloatNode);
export const GMLBrushSpeedToWidthRatioDefinition = createDefinition(
  GMLNodeName.BRUSH_SPEED_TO_WIDTH_RATIO,
  GMLFloatNode,
);
export const GMLBrushUniqueStyleIdDefinition = createDefinition(
  GMLNodeName.BRUSH_UNIQUE_STYLE_ID,
  GMLLeafNode,
);
export const GMLBrushLayerAbsoluteDefinition = createDefinition(
  GMLNodeName.BRUSH_LAYER_ABSOLUTE,
  GMLIntegerNode,
);
export const GMLBrushLayerRelativeDefinition = createDefinition(
  GMLNodeName.BRUSH_LAYER_RELATIVE,
  GMLIntegerNode,
);
export const GMLBrushDripAmountDefinition = createDefinition(
  GMLNodeName.BRUSH_DRIP_AMOUNT,
  GMLFloatNode,
);
export const GMLBrushDripSpeedDefinition = createDefinition(
  GMLNodeName.BRUSH_DRIP_SPEED,
  GMLFloatNode,
);
export const GMLBrushDripVecRelativeToUpDefinition: GMLNodeDefinition<GML3DPoint> = {
  ...GMLDirectionDefinition,
  name: GMLNodeName.BRUSH_DRIP_VEC_RELATIVE_TO_UP,
};
