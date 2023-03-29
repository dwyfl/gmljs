import { GMLNodeDefinition, GMLNodeName } from "../../types";
import { GMLLeafNodeParent } from "../leaf/parent";

export class GMLStrokeInfo extends GMLLeafNodeParent {}

const definition: GMLNodeDefinition = {
  name: GMLNodeName.STROKE_INFO,
  model: GMLStrokeInfo,
  attributes: [],
  children: [
    GMLNodeName.CURVED,
  ],
};

export default definition;
