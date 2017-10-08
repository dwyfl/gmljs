import GMLNode from './node';

export class GMLLeafNodeParent extends GMLNode {
  static createFromObject(obj) {
    const p = new this();
    p.set(obj);
    return p;
  }
  set(obj) {
    for (const i in obj) {
      const child = this.getChild(i);
      if (child) {
        child.value = obj[i];
      }
    }
  }
  toObject() {
    return Object.keys(this.children).reduce((obj, tag) => {
      return {
        ...obj,
        [tag]: this.children[tag][0].toObject(),
      };
    }, {});
  }
}

export class GMLLeafNode extends GMLNode {
  toObject() {
    return this.value;
  }
  getTagContent() {
    return this.value;
  }
  initDefault() {
    this.value = '';
  }
}

export default GMLLeafNode;

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
}

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
}