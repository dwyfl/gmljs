import { GMLNodeDefinition, GMLNodeName } from "../../types";
import { GMLLeafNode } from "../leaf";

export class GMLStrokeInfoCurved extends GMLLeafNode {}

const definition: GMLNodeDefinition = {
  name: GMLNodeName.STROKE_INFO_CURVED,
  model: GMLStrokeInfoCurved,
  attributes: [],
  children: [],
};

export default definition;
