import { type GMLNodeDefinition, GMLNodeName, type GMLParsedNode } from "../../types.ts";
import { GMLLeafNode } from "../leaf/index.ts";
import { GMLIntegerNode } from "../leaf/integer.ts";
import { createDefinition } from "../../util/definition.ts";
import { GMLLeafNodeParent } from "../leaf/parent.ts";
import config from "../../../../package.json" with { type: "json" };

export class GMLClientUsername extends GMLLeafNode {}
export const GMLClientUsernameDefinition: GMLNodeDefinition = createDefinition(
  GMLNodeName.CLIENT_USERNAME,
  GMLClientUsername,
);

export class GMLClientPermalink extends GMLLeafNode {}
export const GMLClientPermalinkDefinition: GMLNodeDefinition = createDefinition(
  GMLNodeName.CLIENT_PERMALINK,
  GMLClientPermalink,
);

export class GMLClientKeywords extends GMLLeafNode {}
export const GMLClientKeywordsDefinition: GMLNodeDefinition = createDefinition(
  GMLNodeName.CLIENT_KEYWORDS,
  GMLClientKeywords,
);

export class GMLClientUniqueKey extends GMLLeafNode {}
export const GMLClientUniqueKeyDefinition: GMLNodeDefinition = createDefinition(
  GMLNodeName.CLIENT_UNIQUEKEY,
  GMLClientUniqueKey,
);

export class GMLClientIp extends GMLLeafNode {}
export const GMLClientIpDefinition: GMLNodeDefinition = createDefinition(
  GMLNodeName.CLIENT_IP,
  GMLClientIp,
);

export class GMLClientName extends GMLLeafNode {
  override init(data?: GMLParsedNode) {
    this.setValue("gmljs");
    super.init(data);
  }
}
export const GMLClientNameDefinition: GMLNodeDefinition = createDefinition(
  GMLNodeName.CLIENT_NAME,
  GMLClientName,
);

export class GMLTime extends GMLIntegerNode {
  override init(data?: GMLParsedNode) {
    super.init(data);
    if (!data) {
      this.setValue(Math.floor(Date.now() / 1000));
    }
  }
}
export const GMLTimeDefinition: GMLNodeDefinition = createDefinition(
  GMLNodeName.CLIENT_TIME,
  GMLTime,
);

export class GMLClientVersion extends GMLLeafNode {
  override init(data?: GMLParsedNode) {
    this.setValue(config.version ?? "unknown");
    super.init(data);
  }
}
export const GMLClientVersionDefinition: GMLNodeDefinition = createDefinition(
  GMLNodeName.CLIENT_VERSION,
  GMLClientVersion,
);

export class GMLLocationLongitude extends GMLLeafNode {}
export const GMLLocationLongitudeDefinition: GMLNodeDefinition = createDefinition(
  GMLNodeName.CLIENT_LOCATION_LON,
  GMLLocationLongitude,
);

export class GMLLocationLatitude extends GMLLeafNode {}
export const GMLLocationLatitudeDefinition: GMLNodeDefinition = createDefinition(
  GMLNodeName.CLIENT_LOCATION_LAT,
  GMLLocationLatitude,
);

export class GMLLocation extends GMLLeafNodeParent {}
export const GMLLocationDefinition: GMLNodeDefinition = {
  name: GMLNodeName.CLIENT_LOCATION,
  model: GMLLocation,
  attributes: [],
  children: [
    { definition: GMLLocationLatitudeDefinition, required: true },
    { definition: GMLLocationLongitudeDefinition, required: true },
  ],
};
