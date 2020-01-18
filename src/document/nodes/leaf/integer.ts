
export class GMLIntegerNode extends GMLLeafNode {
  postInit() {
    if (!Number.isInteger(this.value)) {
      const value = parseInt(this.value);
      if (isNaN(value)) {
        throw new Error(`GMLIntegerNode has non-int value "${this.value}".`);
      }
      this.value = value;
    }
  }
  initDefault() {
    this.value = 0;
  }
  setValue(value) {
    this.value = parseInt(value, 10);
  }
}