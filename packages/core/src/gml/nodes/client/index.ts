import { compact, type GMLClientData } from "../../data.ts";
import { GMLNode } from "../../node.ts";
import { type GMLNodeDefinition, GMLNodeName } from "../../types.ts";
import {
  GMLClientIpDefinition,
  GMLClientKeywordsDefinition,
  GMLClientNameDefinition,
  GMLClientPermalinkDefinition,
  GMLClientUniqueKeyDefinition,
  GMLClientUsernameDefinition,
  GMLClientVersionDefinition,
  GMLLocationDefinition,
  GMLTimeDefinition,
} from "./settings.ts";

export class GMLClient extends GMLNode {
  toData(): GMLClientData {
    const text = (name: GMLNodeName) => {
      const value = this.getChildValue([name]);
      return value === undefined ? undefined : String(value);
    };
    const time = this.getChild(GMLNodeName.CLIENT_TIME)?.getValue();
    const location = this.getChild(GMLNodeName.CLIENT_LOCATION);
    const lat = location?.getChildValue([GMLNodeName.CLIENT_LOCATION_LAT]);
    const lon = location?.getChildValue([GMLNodeName.CLIENT_LOCATION_LON]);
    return compact({
      name: text(GMLNodeName.CLIENT_NAME),
      version: text(GMLNodeName.CLIENT_VERSION),
      username: text(GMLNodeName.CLIENT_USERNAME),
      permalink: text(GMLNodeName.CLIENT_PERMALINK),
      keywords: text(GMLNodeName.CLIENT_KEYWORDS),
      uniqueKey: text(GMLNodeName.CLIENT_UNIQUEKEY),
      ip: text(GMLNodeName.CLIENT_IP),
      time: typeof time === "number" ? time : undefined,
      location: typeof lat === "number" && typeof lon === "number" ? { lat, lon } : undefined,
    });
  }
}

export const GMLClientDefinition: GMLNodeDefinition<GMLClient> = {
  name: GMLNodeName.CLIENT,
  model: GMLClient,
  attributes: [],
  children: [
    { definition: GMLClientNameDefinition, initDefault: true },
    { definition: GMLClientVersionDefinition, initDefault: true },
    { definition: GMLTimeDefinition, initDefault: true },
    GMLClientUsernameDefinition,
    GMLClientPermalinkDefinition,
    GMLClientKeywordsDefinition,
    GMLClientUniqueKeyDefinition,
    GMLClientIpDefinition,
    GMLLocationDefinition,
  ],
};
