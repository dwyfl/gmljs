import { GMLNodeDefinition, GMLNodeName, GMLParsedNode } from "../../types";
import { GMLLeafNode } from "../leaf";
import { GMLIntegerNode } from "../leaf/integer";
import { createDefinition } from "../../util";
import { GMLLeafNodeParent } from "../leaf/parent";
import config from '../../../../package.json';

export class GMLClientUsername extends GMLLeafNode {}
export const GMLClientUsernameDefinition: GMLNodeDefinition = createDefinition(GMLNodeName.CLIENT_USERNAME, GMLClientUsername);

export class GMLClientPermalink extends GMLLeafNode {}
export const GMLClientPermalinkDefinition: GMLNodeDefinition = createDefinition(GMLNodeName.CLIENT_PERMALINK, GMLClientPermalink);

export class GMLClientKeywords extends GMLLeafNode {}
export const GMLClientKeywordsDefinition: GMLNodeDefinition = createDefinition(GMLNodeName.CLIENT_KEYWORDS, GMLClientKeywords);

export class GMLClientUniqueKey extends GMLLeafNode {}
export const GMLClientUniqueKeyDefinition: GMLNodeDefinition = createDefinition(GMLNodeName.CLIENT_UNIQUEKEY, GMLClientUniqueKey);

export class GMLClientIp extends GMLLeafNode {}
export const GMLClientIpDefinition: GMLNodeDefinition = createDefinition(GMLNodeName.CLIENT_IP, GMLClientIp);

export class GMLClientName extends GMLLeafNode {
  init(data?: GMLParsedNode) {
    this.setValue('gmljs');
    super.init(data);
  }
}
export const GMLClientNameDefinition: GMLNodeDefinition = createDefinition(GMLNodeName.CLIENT_NAME, GMLClientName);

export class GMLTime extends GMLIntegerNode {
  init(data?: GMLParsedNode) {
    this.setValue(Math.floor(Date.now() * 0.001));
    super.init(data);
  }
}
export const GMLTimeDefinition: GMLNodeDefinition = createDefinition(GMLNodeName.CLIENT_TIME, GMLTime);

export class GMLClientVersion extends GMLLeafNode {
  init(data?: GMLParsedNode) {
    this.setValue(config.version ?? 'unknown');
    super.init(data);
  }
}
export const GMLClientVersionDefinition: GMLNodeDefinition = createDefinition(GMLNodeName.CLIENT_VERSION, GMLClientVersion);

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
export const GMLLocationLongitudeDefinition: GMLNodeDefinition = createDefinition(GMLNodeName.CLIENT_LOCATION_LON, GMLLocationLongitude);

export class GMLLocationLatitude extends GMLLeafNode {}
export const GMLLocationLatitudeDefinition: GMLNodeDefinition = createDefinition(GMLNodeName.CLIENT_LOCATION_LAT, GMLLocationLatitude);
