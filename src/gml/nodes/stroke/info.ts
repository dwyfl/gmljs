import { type GMLNodeDefinition, GMLNodeName } from "../../types.ts";
import { GMLLeafNodeParent } from "../leaf/parent.ts";
import { GMLStrokeInfoCurvedDefinition } from "./curved.ts";

export class GMLStrokeInfo extends GMLLeafNodeParent {}

export const GMLStrokeInfoDefinition: GMLNodeDefinition = {
  name: GMLNodeName.STROKE_INFO,
  model: GMLStrokeInfo,
  attributes: [],
  children: [GMLStrokeInfoCurvedDefinition],
};

export default GMLStrokeInfoDefinition;
