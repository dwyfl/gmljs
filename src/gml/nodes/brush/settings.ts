import { GMLNodeDefinition, GMLNodeName } from "../../types";
import { createDefinition } from "../../util/definition";
import { GMLLeafNode } from "../leaf";
import { GMLFloatNode } from "../leaf/float";
import { GMLIntegerNode } from "../leaf/integer";
import { GMLLeafNodeParent } from "../leaf/parent";

export class GMLBrushMode extends GMLLeafNode {}
export const GMLBrushModeDefinition: GMLNodeDefinition = createDefinition(
  GMLNodeName.BRUSH_MODE,
  GMLBrushMode
);

export class GMLBrushSpec extends GMLLeafNode {}
export const GMLBrushSpecDefinition: GMLNodeDefinition = createDefinition(
  GMLNodeName.BRUSH_SPEC,
  GMLBrushSpec
);

export class GMLBrushWidth extends GMLFloatNode {}
export const GMLBrushWidthDefinition: GMLNodeDefinition = createDefinition(
  GMLNodeName.BRUSH_WIDTH,
  GMLBrushWidth
);

export class GMLBrushSpeedToWidthRatio extends GMLFloatNode {}
export const GMLBrushSpeedToWidthRatioDefinition: GMLNodeDefinition =
  createDefinition(
    GMLNodeName.BRUSH_SPEED_TO_WIDTH_RATIO,
    GMLBrushSpeedToWidthRatio
  );

export class GMLBrushUniqueStyleId extends GMLLeafNode {}
export const GMLBrushUniqueStyleIdDefinition: GMLNodeDefinition =
  createDefinition(GMLNodeName.BRUSH_UNIQUE_STYLE_ID, GMLBrushUniqueStyleId);

export class GMLBrushLayerAbsolute extends GMLIntegerNode {}
export const GMLBrushLayerAbsoluteDefinition: GMLNodeDefinition =
  createDefinition(GMLNodeName.BRUSH_LAYER_ABSOLUTE, GMLBrushLayerAbsolute);

export class GMLBrushLayerRelative extends GMLIntegerNode {}
export const GMLBrushLayerRelativeDefinition: GMLNodeDefinition =
  createDefinition(GMLNodeName.BRUSH_LAYER_RELATIVE, GMLBrushLayerRelative);

export class GMLBrushDripAmount extends GMLFloatNode {}
export const GMLBrushDripAmountDefinition: GMLNodeDefinition = createDefinition(
  GMLNodeName.BRUSH_DRIP_AMOUNT,
  GMLBrushDripAmount
);

export class GMLBrushDripSpeed extends GMLFloatNode {}
export const GMLBrushDripSpeedDefinition: GMLNodeDefinition = createDefinition(
  GMLNodeName.BRUSH_DRIP_SPEED,
  GMLBrushDripSpeed
);

export class GMLBrushDripVecRelativeToUp extends GMLLeafNodeParent {}
export const GMLBrushDripVecRelativeToUpDefinition: GMLNodeDefinition = {
  name: GMLNodeName.BRUSH_DRIP_VEC_RELATIVE_TO_UP,
  model: GMLBrushDripVecRelativeToUp,
  attributes: [],
  children: [
    { name: GMLNodeName.POINT_X, required: true },
    { name: GMLNodeName.POINT_Y, required: true },
    GMLNodeName.POINT_Z,
  ],
};
