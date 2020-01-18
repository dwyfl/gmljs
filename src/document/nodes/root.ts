import { GMLNode, GMLNodeDefinition, GMLAttributeDefinition } from '../../gml';
import { GMLTag } from './tag';

export class GMLRoot extends GMLNode {
  public static getTagName(): string {
    return 'gml';
  }
  public static getSupportedChildNodes(): GMLNodeDefinition[] {
    return [
      GMLTag.getNodeDefinition({ initDefault: true }),
    ];
  }
  public static getSupportedAttributes(): GMLAttributeDefinition[] {
    return [
      { name: 'spec', defaultValue: '1.0' },
    ];
  }
  public getTags(index: number): GMLTag | GMLTag[] {
    return <GMLTag>this.getChild(index === undefined ? 'tag' : ['tag', index]);
  }
}