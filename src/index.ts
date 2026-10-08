import type { GMLClient } from "./gml/nodes/client/index.ts";
import type { GMLDocument } from "./gml/nodes/document/index.ts";
import type { GMLDrawing } from "./gml/nodes/drawing/index.ts";
import type { GMLPoint } from "./gml/nodes/point/index.ts";
import type { GMLStroke } from "./gml/nodes/stroke/index.ts";
import type { GMLTag } from "./gml/nodes/tag/index.ts";
import { GMLNodeName } from "./gml/types.ts";
import { createGmlNodeFromTagName, parseGML } from "./gml/util/index.ts";

export { GMLParseError } from "./errors.ts";
export {
  GMLNodeAttribute,
  GMLNodeName,
  isGMLNodeAttribute,
  isGMLNodeName,
  type GMLAttributeDefinition,
  type GMLChildNodeDefinition,
  type GMLNodeAttributeValue,
  type GMLNodeChildPath,
  type GMLNodeDefinition,
  type GMLNodeValue,
  type GMLObjectRepresentation,
} from "./gml/types.ts";
export type { GMLNodeAtPath, GMLNodeTypeMap } from "./gml/type-map.ts";
export {
  createGMLDocumentFromPointArrays,
  createGmlNodeFromTagName,
  createGmlNodeFromXml,
  parseGML,
  type GMLPointValues,
} from "./gml/util/index.ts";

export { GMLNode } from "./gml/node.ts";
export { GMLLeafNode } from "./gml/nodes/leaf/index.ts";
export { GMLLeafNodeParent } from "./gml/nodes/leaf/parent.ts";
export { GMLFloatNode } from "./gml/nodes/leaf/float.ts";
export { GMLIntegerNode } from "./gml/nodes/leaf/integer.ts";
export { GMLDocument } from "./gml/nodes/document/index.ts";
export { GMLRoot } from "./gml/nodes/root/index.ts";
export { GMLTag } from "./gml/nodes/tag/index.ts";
export { GMLHeader } from "./gml/nodes/header/index.ts";
export { GMLClient } from "./gml/nodes/client/index.ts";
export { GMLLocation, GMLTime } from "./gml/nodes/client/settings.ts";
export { GMLEnvironment } from "./gml/nodes/environment/index.ts";
export { GMLDrawing } from "./gml/nodes/drawing/index.ts";
export { GMLStroke } from "./gml/nodes/stroke/index.ts";
export { GMLStrokeInfo } from "./gml/nodes/stroke/info.ts";
export { GML3DPoint, GMLPoint } from "./gml/nodes/point/index.ts";
export { GMLDirection } from "./gml/nodes/point/direction.ts";
export { GMLColor } from "./gml/nodes/point/color.ts";
export { GMLBrush } from "./gml/nodes/brush/index.ts";

export class GML {
  doc: GMLDocument;
  /** @throws {GMLParseError} if `str` is not a valid GML document. */
  constructor(str?: string) {
    this.doc =
      typeof str === "string" ? parseGML(str) : createGmlNodeFromTagName(GMLNodeName.DOCUMENT);
  }
  init(str: string) {
    this.doc = parseGML(str);
  }
  /** The `<client>` node of the first tag. */
  getClient(): GMLClient | undefined {
    return this.doc.getChildPath([
      GMLNodeName.ROOT,
      GMLNodeName.TAG,
      GMLNodeName.HEADER,
      GMLNodeName.CLIENT,
    ]);
  }
  /** The client `<username>`, falling back to the client application `<name>`. */
  getTitle(): string | undefined {
    const client = this.getClient();
    const title =
      client?.getChildValue([GMLNodeName.CLIENT_USERNAME]) ??
      client?.getChildValue([GMLNodeName.CLIENT_NAME]);
    return title === undefined ? undefined : String(title);
  }
  getSize(tag: number = 0) {
    return this.getTag(tag)?.getEnvironment()?.getScreenBounds();
  }
  getRoot() {
    return this.doc.getChild(GMLNodeName.ROOT);
  }
  getTags(): GMLTag[] {
    return this.getRoot()?.getTags() ?? [];
  }
  getTag(index: number): GMLTag | undefined {
    return this.getTags()[index];
  }
  getDrawings(tag: number): GMLDrawing[] {
    return this.getTag(tag)?.getDrawings() ?? [];
  }
  getDrawing(tag: number, index: number): GMLDrawing | undefined {
    return this.getDrawings(tag)[index];
  }
  getStrokes(tag: number, drawing: number): GMLStroke[] {
    return this.getDrawing(tag, drawing)?.getStrokes() ?? [];
  }
  getStroke(tag: number, drawing: number, index: number): GMLStroke | undefined {
    return this.getStrokes(tag, drawing)[index];
  }
  getPoints(tag: number, drawing: number, stroke: number): GMLPoint[] {
    return this.getStroke(tag, drawing, stroke)?.getPoints() ?? [];
  }
  getPoint(tag: number, drawing: number, stroke: number, index: number): GMLPoint | undefined {
    return this.getPoints(tag, drawing, stroke)[index];
  }
  toString() {
    return this.doc.toString();
  }
}

export default GML;
