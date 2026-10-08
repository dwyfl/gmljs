import { GMLNodeName } from "../../types.ts";
import { createDefinition } from "../../util/definition.ts";
import { GMLLeafNodeParent } from "../leaf/parent.ts";
import { GMLStrokeInfoCurvedDefinition } from "./curved.ts";

export const GMLStrokeInfoDefinition = createDefinition(
  GMLNodeName.STROKE_INFO,
  GMLLeafNodeParent,
  {
    children: [GMLStrokeInfoCurvedDefinition],
  },
);

export default GMLStrokeInfoDefinition;
