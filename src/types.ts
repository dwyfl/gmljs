type GMLParsedNode = Document | Element;

export type GMLNodeValue = string | number;
export type GMLNodeAttributeValue = string | number;
export type GMLNodeChildPath = string | [string, number];

export interface GMLNodeAttributes {
  [key: string]: GMLNodeAttributeValue
}
export interface GMLNodeChildren {
  [key: string]: GMLNode[]
}
export interface GMLNodeDefinition {
  name: string
  model: (typeof GMLNode)
  required?: boolean
  initDefault?: boolean
}
export interface GMLAttributeDefinition {
  name: string
  parser?: (value: string) => GMLNodeAttributeValue
  required?: boolean
  defaultValue?: GMLNodeAttributeValue
}