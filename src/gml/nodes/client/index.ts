import { GMLNode } from "../../node.ts";
import { type GMLNodeDefinition, GMLNodeName } from "../../types.ts";

export class GMLClient extends GMLNode {}

export const GMLClientDefinition: GMLNodeDefinition = {
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
