import { GMLNode, GMLNodeDefinition, GMLAttributeDefinition } from '../../gml';
import { GMLHeader } from './header';
import { GMLEnvironment } from './environment';
import { GMLDrawing } from './drawing';

export class GMLTag extends GMLNode {
  public static getTagName(): string {
    return 'tag';
  }
  public static getSupportedChildNodes(): GMLNodeDefinition[] {
    return [
      GMLEnvironment.getNodeDefinition(),
      GMLHeader.getNodeDefinition(),
      GMLDrawing.getNodeDefinition({ initDefault: true }),
    ];
  }
  public getEnvironment(): object | null {
    let env = this.getChild(['header', ['environment', 0]]);
    if (env === null) {
      env = this.getChild(['environment', 0]);
    }
    return env ? env.toObject() : null;
  }
  public getClientName() {
    return this.getChild(['header', 'client', 'name'], { value: null }).value;
  }
  public getDrawings(index: number) {
    return this.getChild(index === undefined ? 'drawing' : ['drawing', index]);
  }
}
