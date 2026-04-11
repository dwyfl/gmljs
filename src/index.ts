import { GMLClient } from "./gml/nodes/client/index.ts";
import { GMLClientUsername } from "./gml/nodes/client/settings.ts";
import { GMLDocument } from "./gml/nodes/document/index.ts";
import { GMLRoot } from "./gml/nodes/root/index.ts";
import { GMLTag } from "./gml/nodes/tag/index.ts";
import { GMLNodeName } from "./gml/types.ts";
import { createGmlNodeFromTagName } from "./gml/util/index.ts";
import { parseXml } from "./util/xml.ts";

export { GMLPoint } from "./gml/nodes/point/index.ts";
export { GMLStroke } from "./gml/nodes/stroke/index.ts";
export { GMLDrawing } from "./gml/nodes/drawing/index.ts";
export { GMLTag } from "./gml/nodes/tag/index.ts";
export { GMLEnvironment } from "./gml/nodes/environment/index.ts";
export { GMLDocument } from "./gml/nodes/document/index.ts";

export class GML {
  doc: GMLDocument;
  constructor(str?: string) {
    this.doc =
      typeof str === "string"
        ? createGmlNodeFromTagName(GMLNodeName.DOCUMENT, parseXml(str))
        : createGmlNodeFromTagName(GMLNodeName.DOCUMENT);
  }
  init(str: string) {
    this.doc = createGmlNodeFromTagName(GMLNodeName.DOCUMENT, parseXml(str));
  }
  getClient(): string | undefined {
    return this.doc
      .getChildPath<GMLClient>([
        GMLNodeName.ROOT,
        GMLNodeName.TAG,
        GMLNodeName.HEADER,
        GMLNodeName.CLIENT,
      ])
      ?.getValue()
      .toString();
  }
  getTitle(): string | undefined {
    return this.doc
      .getChildPath<GMLClientUsername>([
        GMLNodeName.ROOT,
        GMLNodeName.TAG,
        GMLNodeName.HEADER,
        GMLNodeName.CLIENT,
        GMLNodeName.CLIENT_USERNAME,
      ])
      ?.getValue()
      .toString();
  }
  getRoot() {
    return this.doc.getChild<GMLRoot>(GMLNodeName.ROOT);
  }
  getTags(): GMLTag[] {
    const node = this.getRoot();
    return node?.getTags() ?? [];
  }
  getTag(index: number) {
    const node = this.getTags();
    return node ? node[index] : undefined;
  }
  getDrawings(tag: number) {
    const node = this.getTag(tag);
    return node?.getDrawings();
  }
  getDrawing(tag: number, index: number) {
    const node = this.getDrawings(tag);
    return node ? node[index] : undefined;
  }
  getStrokes(tag: number, drawing: number) {
    const node = this.getDrawing(tag, drawing);
    return node?.getStrokes();
  }
  getStroke(tag: number, drawing: number, index: number) {
    const node = this.getStrokes(tag, drawing);
    return node ? node[index] : undefined;
  }
  getPoints(tag: number, drawing: number, stroke: number) {
    const node = this.getStroke(tag, drawing, stroke);
    return node?.getPoints();
  }
  getPoint(tag: number, drawing: number, stroke: number, index: number) {
    const node = this.getPoints(tag, drawing, stroke);
    return node ? node[index] : undefined;
  }
  toString() {
    return this.doc?.toString() ?? "";
  }
}

export default GML;
