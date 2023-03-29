import { GMLNode } from '../..';

export class GMLLeafNode extends GMLNode {
  getTagContent() {
    return this.value.toString();
  }
}
