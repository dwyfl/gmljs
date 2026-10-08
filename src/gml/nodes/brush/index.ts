import { GMLNode } from "../../node.ts";
import { type GMLNodeDefinition, GMLNodeName } from "../../types.ts";
import { GMLColorDefinition } from "../point/color.ts";
import {
  GMLBrushDripAmountDefinition,
  GMLBrushDripSpeedDefinition,
  GMLBrushDripVecRelativeToUpDefinition,
  GMLBrushLayerAbsoluteDefinition,
  GMLBrushLayerRelativeDefinition,
  GMLBrushModeDefinition,
  GMLBrushSpecDefinition,
  GMLBrushSpeedToWidthRatioDefinition,
  GMLBrushUniqueStyleIdDefinition,
  GMLBrushWidthDefinition,
} from "./settings.ts";

export class GMLBrush extends GMLNode {
  getWidth() {
    return this.getChild(GMLNodeName.BRUSH_WIDTH)?.getFloatValue();
  }
  getColor() {
    return this.getChild(GMLNodeName.COLOR)?.getRGBA();
  }
  getDrip() {
    const dripAmount = this.getChild(GMLNodeName.BRUSH_DRIP_AMOUNT)?.getFloatValue();
    const dripSpeed = this.getChild(GMLNodeName.BRUSH_DRIP_SPEED)?.getFloatValue();
    const dripVecUp = this.getChild(GMLNodeName.BRUSH_DRIP_VEC_RELATIVE_TO_UP)?.getXYZ();
    return {
      dripAmount,
      dripSpeed,
      dripVecUp,
    };
  }
}

export const GMLBrushDefinition: GMLNodeDefinition<GMLBrush> = {
  name: GMLNodeName.BRUSH,
  model: GMLBrush,
  attributes: [],
  children: [
    GMLColorDefinition,
    GMLBrushModeDefinition,
    GMLBrushSpecDefinition,
    GMLBrushWidthDefinition,
    GMLBrushSpeedToWidthRatioDefinition,
    GMLBrushDripAmountDefinition,
    GMLBrushDripSpeedDefinition,
    GMLBrushDripVecRelativeToUpDefinition,
    GMLBrushLayerAbsoluteDefinition,
    GMLBrushLayerRelativeDefinition,
    GMLBrushUniqueStyleIdDefinition,
  ],
};
