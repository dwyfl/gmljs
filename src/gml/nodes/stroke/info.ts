import { type GMLNodeDefinition, GMLNodeName } from "../../types.ts";
import { GMLLeafNodeParent } from "../leaf/parent.ts";

export class GMLStrokeInfo extends GMLLeafNodeParent {}

export const GMLStrokeInfoDefinition: GMLNodeDefinition = {
  name: GMLNodeName.STROKE_INFO,
  model: GMLStrokeInfo,
  attributes: [],
  children: [GMLNodeName.STROKE_INFO_CURVED],
};

export default GMLStrokeInfoDefinition;
