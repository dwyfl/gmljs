import { GMLNodeName } from "../../types.ts";
import { createDefinition } from "../../util/definition.ts";
import { GMLLeafNode } from "../leaf/index.ts";
import { GMLIntegerNode } from "../leaf/integer.ts";
import { GMLLeafNodeParent } from "../leaf/parent.ts";
import config from "../../../../package.json" with { type: "json" };

export const GMLClientUsernameDefinition = createDefinition(
  GMLNodeName.CLIENT_USERNAME,
  GMLLeafNode,
);
export const GMLClientPermalinkDefinition = createDefinition(
  GMLNodeName.CLIENT_PERMALINK,
  GMLLeafNode,
);
export const GMLClientKeywordsDefinition = createDefinition(
  GMLNodeName.CLIENT_KEYWORDS,
  GMLLeafNode,
);
export const GMLClientUniqueKeyDefinition = createDefinition(
  GMLNodeName.CLIENT_UNIQUEKEY,
  GMLLeafNode,
);
export const GMLClientIpDefinition = createDefinition(GMLNodeName.CLIENT_IP, GMLLeafNode);
export const GMLClientNameDefinition = createDefinition(GMLNodeName.CLIENT_NAME, GMLLeafNode, {
  defaultValue: "gmljs",
});
export const GMLClientVersionDefinition = createDefinition(
  GMLNodeName.CLIENT_VERSION,
  GMLLeafNode,
  { defaultValue: config.version ?? "unknown" },
);
/** Unix timestamp. Note that <time> under <pt> is a float; see GMLPointTimeDefinition. */
export const GMLTimeDefinition = createDefinition(GMLNodeName.CLIENT_TIME, GMLIntegerNode, {
  defaultValue: () => Math.floor(Date.now() / 1000),
});
export const GMLLocationLongitudeDefinition = createDefinition(
  GMLNodeName.CLIENT_LOCATION_LON,
  GMLLeafNode,
);
export const GMLLocationLatitudeDefinition = createDefinition(
  GMLNodeName.CLIENT_LOCATION_LAT,
  GMLLeafNode,
);
export const GMLLocationDefinition = createDefinition(
  GMLNodeName.CLIENT_LOCATION,
  GMLLeafNodeParent,
  {
    children: [
      { definition: GMLLocationLatitudeDefinition, required: true },
      { definition: GMLLocationLongitudeDefinition, required: true },
    ],
  },
);
