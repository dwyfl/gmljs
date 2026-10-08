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

export class GMLClient extends GMLNode {}

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
