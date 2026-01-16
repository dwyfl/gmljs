import {
  GMLNodeDefinition,
  GMLNodeName,
  GMLNodeValue,
  GMLParsedNode,
} from "../../types";
import { GMLLeafNode } from "../leaf";
import { GMLIntegerNode } from "../leaf/integer";
import { createDefinition } from "../../util/definition";
import { GMLLeafNodeParent } from "../leaf/parent";
import config from "../../../../package.json";

export class GMLClientUsername extends GMLLeafNode {}
export const GMLClientUsernameDefinition: GMLNodeDefinition = createDefinition(
  GMLNodeName.CLIENT_USERNAME,
  GMLClientUsername
);

export class GMLClientPermalink extends GMLLeafNode {}
export const GMLClientPermalinkDefinition: GMLNodeDefinition = createDefinition(
  GMLNodeName.CLIENT_PERMALINK,
  GMLClientPermalink
);

export class GMLClientKeywords extends GMLLeafNode {}
export const GMLClientKeywordsDefinition: GMLNodeDefinition = createDefinition(
  GMLNodeName.CLIENT_KEYWORDS,
  GMLClientKeywords
);

export class GMLClientUniqueKey extends GMLLeafNode {}
export const GMLClientUniqueKeyDefinition: GMLNodeDefinition = createDefinition(
  GMLNodeName.CLIENT_UNIQUEKEY,
  GMLClientUniqueKey
);

export class GMLClientIp extends GMLLeafNode {}
export const GMLClientIpDefinition: GMLNodeDefinition = createDefinition(
  GMLNodeName.CLIENT_IP,
  GMLClientIp
);

export class GMLClientName extends GMLLeafNode {
  init(data?: GMLParsedNode) {
    this.setValue("gmljs");
    super.init(data);
  }
}
export const GMLClientNameDefinition: GMLNodeDefinition = createDefinition(
  GMLNodeName.CLIENT_NAME,
  GMLClientName
);

export class GMLTime extends GMLLeafNode {
  /**
   * `declare` tells TypeScript the property exists but does not emit
   * any initialization code. This allows the value set in init() to
   * persist.
   */
  declare private stringValue: string;
  constructor(definition: GMLNodeDefinition, data?: GMLParsedNode) {
    super(definition, data);
    this.stringValue = data?.textContent ?? "";
  }
  init(data?: GMLParsedNode) {
    this.setValue(Math.floor(Date.now() * 0.001));
    super.init(data);
  }
  parseValue(data: GMLParsedNode) {
    const value = data.textContent ?? "";
    const intValue = parseInt(value, 10);
    if (!Number.isFinite(intValue)) {
      throw new Error(`Unable to parse value "${value}" as integer.`);
    }
    this.value = intValue;
    this.stringValue = value;
  }
  get floatValue() {
    return this.stringValue ? parseFloat(this.stringValue) : undefined;
  }
}
export const GMLTimeDefinition: GMLNodeDefinition = createDefinition(
  GMLNodeName.CLIENT_TIME,
  GMLTime
);

export class GMLClientVersion extends GMLLeafNode {
  init(data?: GMLParsedNode) {
    this.setValue(config.version ?? "unknown");
    super.init(data);
  }
}
export const GMLClientVersionDefinition: GMLNodeDefinition = createDefinition(
  GMLNodeName.CLIENT_VERSION,
  GMLClientVersion
);

export class GMLLocation extends GMLLeafNodeParent {}
export const GMLLocationDefinition: GMLNodeDefinition = {
  name: GMLNodeName.CLIENT_LOCATION,
  model: GMLLocation,
  attributes: [],
  children: [
    { name: GMLNodeName.CLIENT_LOCATION_LAT, required: true },
    { name: GMLNodeName.CLIENT_LOCATION_LON, required: true },
  ],
};

export class GMLLocationLongitude extends GMLLeafNode {}
export const GMLLocationLongitudeDefinition: GMLNodeDefinition =
  createDefinition(GMLNodeName.CLIENT_LOCATION_LON, GMLLocationLongitude);

export class GMLLocationLatitude extends GMLLeafNode {}
export const GMLLocationLatitudeDefinition: GMLNodeDefinition =
  createDefinition(GMLNodeName.CLIENT_LOCATION_LAT, GMLLocationLatitude);
