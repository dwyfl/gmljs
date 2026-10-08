import { GMLNodeName } from "../../types.ts";
import { createDefinition } from "../../util/definition.ts";
import { GMLLeafNode } from "../leaf/index.ts";

export const GMLStrokeInfoCurvedDefinition = createDefinition(
  GMLNodeName.STROKE_INFO_CURVED,
  GMLLeafNode,
);

export default GMLStrokeInfoCurvedDefinition;
