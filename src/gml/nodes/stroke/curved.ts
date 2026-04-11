import { type GMLNodeDefinition, GMLNodeName } from "../../types.ts";
import { GMLLeafNode } from "../leaf/index.ts";

export class GMLStrokeInfoCurved extends GMLLeafNode {}

export const GMLStrokeInfoCurvedDefinition: GMLNodeDefinition = {
  name: GMLNodeName.STROKE_INFO_CURVED,
  model: GMLStrokeInfoCurved,
  attributes: [],
  children: [],
};

export default GMLStrokeInfoCurvedDefinition;
