import type { GMLNode } from "../node.ts";
import type { GMLNodeConstructor, GMLNodeDefinition, GMLNodeName } from "../types.ts";

export const createDefinition = <T extends GMLNode>(
  name: GMLNodeName,
  model: GMLNodeConstructor<T>,
  options: Partial<Omit<GMLNodeDefinition, "name" | "model">> = {},
): GMLNodeDefinition<T> => ({
  name,
  model,
  attributes: [],
  children: [],
  ...options,
});
