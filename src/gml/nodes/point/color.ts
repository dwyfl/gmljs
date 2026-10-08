import { type GMLNodeDefinition, GMLNodeName } from "../../types.ts";
import { GMLFloatNode } from "../leaf/float.ts";
import { GMLLeafNodeParent } from "../leaf/parent.ts";
import { createDefinition } from "../../util/definition.ts";

export const GMLColorRDefinition = createDefinition(GMLNodeName.COLOR_R, GMLFloatNode);
export const GMLColorGDefinition = createDefinition(GMLNodeName.COLOR_G, GMLFloatNode);
export const GMLColorBDefinition = createDefinition(GMLNodeName.COLOR_B, GMLFloatNode);
export const GMLColorADefinition = createDefinition(GMLNodeName.COLOR_A, GMLFloatNode);

export class GMLColor extends GMLLeafNodeParent {
  getRGBA(): [r: number, g: number, b: number, a: number] | undefined {
    const r = this.getChild(GMLNodeName.COLOR_R)?.getFloatValue();
    const g = this.getChild(GMLNodeName.COLOR_G)?.getFloatValue();
    const b = this.getChild(GMLNodeName.COLOR_B)?.getFloatValue();
    const a = this.getChild(GMLNodeName.COLOR_A)?.getFloatValue() ?? 1;
    return r !== undefined && g !== undefined && b !== undefined ? [r, g, b, a] : undefined;
  }
}

export const GMLColorDefinition: GMLNodeDefinition<GMLColor> = {
  name: GMLNodeName.COLOR,
  model: GMLColor,
  attributes: [],
  children: [
    { definition: GMLColorRDefinition, required: true, initDefault: true },
    { definition: GMLColorGDefinition, required: true, initDefault: true },
    { definition: GMLColorBDefinition, required: true, initDefault: true },
    GMLColorADefinition,
  ],
};
