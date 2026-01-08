import { GMLNode } from "../..";
import { GMLNodeDefinition, GMLNodeName } from "../../types";
import { GMLEnvironment } from "../environment";
import { GMLDrawing } from "../drawing";

export class GMLTag extends GMLNode {
  getEnvironment() {
    return (
      this.getChildPath<GMLEnvironment>([
        GMLNodeName.HEADER,
        [GMLNodeName.ENVIRONMENT, 0],
      ]) ?? this.getChildPath<GMLEnvironment>([[GMLNodeName.ENVIRONMENT, 0]])
    );
  }
  getClientName() {
    return (
      this.getChildValueString([
        GMLNodeName.HEADER,
        GMLNodeName.CLIENT,
        GMLNodeName.CLIENT_NAME,
      ]) ?? "unknown"
    );
  }
  getDrawing(index: number = 0) {
    return this.getChild<GMLDrawing>([GMLNodeName.DRAWING, index]);
  }
  getDrawings() {
    return this.getChildren<GMLDrawing>(GMLNodeName.DRAWING);
  }
}

export const GMLTagDefinition: GMLNodeDefinition = {
  name: GMLNodeName.TAG,
  model: GMLTag,
  attributes: [],
  children: [
    GMLNodeName.ENVIRONMENT,
    GMLNodeName.HEADER,
    { name: GMLNodeName.DRAWING, initDefault: true },
  ],
};

export default GMLTagDefinition;
