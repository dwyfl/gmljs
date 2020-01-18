import { GMLNode, GMLNodeDefinition } from '../gml';
import { GMLRoot } from './nodes/root';

export class GMLDocument extends GMLNode {
  public static getTagName(): string {
    throw new Error('GMLDocument is not a tag.');
  }
  public static getSupportedChildNodes(): GMLNodeDefinition[] {
    return [
      GMLRoot.getNodeDefinition({ initDefault: true }),
    ];
  }
  toString() {
    return this.children.gml && this.children.gml.length
      ? this.children.gml[0].toString()
      : '';
  }
}
