import { GMLNode } from '../../../gml';

export class GMLLeafNode extends GMLNode {
  toObject() {
    return this.value;
  }
  public getTagContent(): string {
    return this.value.toString();
  }
  initDefault() {
    this.setValue('');
  }
  setValue(value: string | number) {
    this.value = value;
  }
}
