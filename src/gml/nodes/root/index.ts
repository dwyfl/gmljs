import { GMLNode } from "../../node.ts";
import { GMLTag } from "../tag/index.ts";
import { GMLNodeAttribute, type GMLNodeDefinition, GMLNodeName } from "../../types.ts";

export class GMLRoot extends GMLNode {
  public getTag(index: number = 0) {
    return this.getChild<GMLTag>([GMLNodeName.TAG, index]);
  }
  public getTags() {
    return this.getChildren<GMLTag>(GMLNodeName.TAG);
  }
}

export const GMLRootDefinition: GMLNodeDefinition = {
  name: GMLNodeName.ROOT,
  model: GMLRoot,
  attributes: [{ name: GMLNodeAttribute.SPEC, defaultValue: "1.0" }],
  children: [{ name: GMLNodeName.TAG, initDefault: true }],
};

export default GMLRootDefinition;
