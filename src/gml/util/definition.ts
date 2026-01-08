import { GMLNodeConstructor, GMLNodeDefinition, GMLNodeName } from "../types";

export const createDefinition = (
  name: GMLNodeName,
  model: GMLNodeConstructor
): GMLNodeDefinition => ({
  name,
  model,
  attributes: [],
  children: [],
});
