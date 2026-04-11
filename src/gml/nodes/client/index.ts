import { GMLNode } from "../../node.ts";
import { type GMLNodeDefinition, GMLNodeName, type GMLParsedNode } from "../../types.ts";

export class GMLClient extends GMLNode {
  init(data?: GMLParsedNode) {
    super.init(data);
    // TODO: Add <version> if default <name> was created
  }
}

export const definition: GMLNodeDefinition = {
  name: GMLNodeName.CLIENT,
  model: GMLClient,
  attributes: [],
  children: [
    { name: GMLNodeName.CLIENT_NAME, initDefault: true },
    { name: GMLNodeName.CLIENT_VERSION, initDefault: true },
    { name: GMLNodeName.CLIENT_TIME, initDefault: true },
    GMLNodeName.CLIENT_USERNAME,
    GMLNodeName.CLIENT_PERMALINK,
    GMLNodeName.CLIENT_KEYWORDS,
    GMLNodeName.CLIENT_UNIQUEKEY,
    GMLNodeName.CLIENT_IP,
    GMLNodeName.CLIENT_LOCATION,
  ],
};

export default definition;
