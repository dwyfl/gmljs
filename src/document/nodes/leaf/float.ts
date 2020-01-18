
export class GMLFloatNode extends GMLLeafNode {
  postInit() {
    const value = parseFloat(this.value);
    if (isNaN(value) || !Number.isFinite(value)) {
      throw new Error(`GMLFloatNode has non-float value "${this.value}".`);
    }
    this.value = value;
  }
  initDefault() {
    this.value = 0.0;
  }
  setValue(value) {
    this.value = parseFloat(value);
  }
}
