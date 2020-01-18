import { GMLNode, GMLNodeDefinition, GMLAttributeDefinition } from '../../gml';
import GMLClient from './client';
import GMLEnvironment from './environment';

export class GMLHeader extends GMLNode {
  public static getTagName(): string {
    return 'header';
  }
  public static getSupportedChildNodes(): GMLNodeDefinition[] {
    return [
      GMLClient.getNodeDefinition(),
      GMLEnvironment.getNodeDefinition(),
    ];
  }
}
