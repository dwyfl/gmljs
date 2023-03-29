import { GMLNodeDefinition, GMLNodeName } from "../../types";
import { GMLLeafNodeParent } from "../leaf/parent";

export class GMLDirection extends GMLLeafNodeParent {}

const definition: GMLNodeDefinition = {
  name: GMLNodeName.DIRECTION,
  model: GMLDirection,
  attributes: [],
  children: [
    { name: GMLNodeName.POINT_X, required: true },
    { name: GMLNodeName.POINT_Y, required: true },
    GMLNodeName.POINT_Z,
  ],
};

export default definition;
