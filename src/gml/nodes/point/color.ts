import { GMLNodeDefinition, GMLNodeName, GMLParsedNode } from "../../types";
import { GMLFloatNode } from "../leaf/float";
import { GMLLeafNodeParent } from "../leaf/parent";
import { createDefinition } from "../../util/definition";

export class GMLColorR extends GMLFloatNode {}
export const GMLColorRDefinition: GMLNodeDefinition = createDefinition(
  GMLNodeName.COLOR_R,
  GMLColorR
);

export class GMLColorG extends GMLFloatNode {}
export const GMLColorGDefinition: GMLNodeDefinition = createDefinition(
  GMLNodeName.COLOR_G,
  GMLColorG
);

export class GMLColorB extends GMLFloatNode {}
export const GMLColorBDefinition: GMLNodeDefinition = createDefinition(
  GMLNodeName.COLOR_B,
  GMLColorB
);

export class GMLColorA extends GMLFloatNode {}
export const GMLColorADefinition: GMLNodeDefinition = createDefinition(
  GMLNodeName.COLOR_A,
  GMLColorA
);

export class GMLColor extends GMLLeafNodeParent {}

export const GMLColorDefinition: GMLNodeDefinition = {
  name: GMLNodeName.COLOR,
  model: GMLColor,
  attributes: [],
  children: [
    { name: GMLNodeName.COLOR_R, required: true, initDefault: true },
    { name: GMLNodeName.COLOR_G, required: true, initDefault: true },
    { name: GMLNodeName.COLOR_B, required: true, initDefault: true },
    GMLNodeName.COLOR_A,
  ],
};

export default GMLColorDefinition;
