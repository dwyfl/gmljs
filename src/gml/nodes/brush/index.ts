import { GMLNode } from "../../node.ts";
import { type GMLNodeDefinition, GMLNodeName } from "../../types.ts";
import type { GMLColor } from "../point/color.ts";
import {
  GMLBrushDripAmount,
  GMLBrushDripSpeed,
  GMLBrushDripVecRelativeToUp,
  GMLBrushWidth,
} from "./settings.ts";

export class GMLBrush extends GMLNode {
  getWidth() {
    return this.getChild<GMLBrushWidth>(GMLNodeName.BRUSH_WIDTH)?.getFloatValue();
  }
  getColor() {
    return this.getChild<GMLColor>(GMLNodeName.COLOR)?.getRGBA();
  }
  getDrip() {
    const dripAmount = this.getChild<GMLBrushDripAmount>(
      GMLNodeName.BRUSH_DRIP_AMOUNT,
    )?.getFloatValue();
    const dripSpeed = this.getChild<GMLBrushDripSpeed>(
      GMLNodeName.BRUSH_DRIP_SPEED,
    )?.getFloatValue();
    const dripVecUp = this.getChild<GMLBrushDripVecRelativeToUp>(
      GMLNodeName.BRUSH_DRIP_VEC_RELATIVE_TO_UP,
    )?.getXYZ();
    return {
      dripAmount,
      dripSpeed,
      dripVecUp,
    };
  }
}

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
