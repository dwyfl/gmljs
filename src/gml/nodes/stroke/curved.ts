import { GMLNodeDefinition, GMLNodeName } from "../../types";
import { GMLLeafNode } from "../leaf";

export class GMLStrokeInfoCurved extends GMLLeafNode {}

export const GMLStrokeInfoCurvedDefinition: GMLNodeDefinition = {
  name: GMLNodeName.STROKE_INFO_CURVED,
  model: GMLStrokeInfoCurved,
  attributes: [],
  children: [],
};

export default GMLStrokeInfoCurvedDefinition;
