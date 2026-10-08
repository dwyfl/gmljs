import { GMLNode } from "../../node.ts";
import { type GMLTag, GMLTagDefinition } from "../tag/index.ts";
import { GMLNodeAttribute, type GMLNodeDefinition, GMLNodeName } from "../../types.ts";

export class GMLRoot extends GMLNode {
  public getTag(index: number = 0) {
    return this.getChild([GMLNodeName.TAG, index]);
  }
  public getTags(): readonly GMLTag[] {
    return this.getChildren(GMLNodeName.TAG) ?? [];
  }
}

export const GMLRootDefinition: GMLNodeDefinition<GMLRoot> = {
  name: GMLNodeName.ROOT,
  model: GMLRoot,
  attributes: [{ name: GMLNodeAttribute.SPEC, defaultValue: "1.0" }],
  children: [{ definition: GMLTagDefinition, initDefault: true }],
};

export default GMLRootDefinition;
