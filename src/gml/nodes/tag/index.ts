import { GMLNode } from "../../node.ts";
import { type GMLNodeDefinition, GMLNodeName } from "../../types.ts";
import { type GMLDrawing, GMLDrawingDefinition } from "../drawing/index.ts";
import { GMLEnvironmentDefinition } from "../environment/index.ts";
import { GMLHeaderDefinition } from "../header/index.ts";

export class GMLTag extends GMLNode {
  getEnvironment() {
    return (
      this.getChildPath([GMLNodeName.HEADER, GMLNodeName.ENVIRONMENT]) ??
      this.getChild(GMLNodeName.ENVIRONMENT)
    );
  }
  getClientName(): string {
    const name = this.getChildValue([
      GMLNodeName.HEADER,
      GMLNodeName.CLIENT,
      GMLNodeName.CLIENT_NAME,
    ]);
    return name === undefined ? "unknown" : String(name);
  }
  getDrawing(index: number = 0) {
    return this.getChild([GMLNodeName.DRAWING, index]);
  }
  getDrawings(): GMLDrawing[] {
    return this.getChildren(GMLNodeName.DRAWING) ?? [];
  }
}

export const GMLTagDefinition: GMLNodeDefinition = {
  name: GMLNodeName.TAG,
  model: GMLTag,
  attributes: [],
  children: [
    GMLEnvironmentDefinition,
    GMLHeaderDefinition,
    { definition: GMLDrawingDefinition, initDefault: true },
  ],
};

export default GMLTagDefinition;
