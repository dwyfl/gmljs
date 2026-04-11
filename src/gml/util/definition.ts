import { type GMLNodeConstructor, type GMLNodeDefinition, GMLNodeName } from "../types.ts";

export const createDefinition = (
  name: GMLNodeName,
  model: GMLNodeConstructor,
): GMLNodeDefinition => ({
  name,
  model,
  attributes: [],
  children: [],
});
