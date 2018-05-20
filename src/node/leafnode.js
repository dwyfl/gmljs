import GMLNode from './node';

export class GMLLeafNodeParent extends GMLNode {
  static createFromObject(obj) {
    const node = new this();
    node.init();
    node.setValues(obj);
    return node;
  }
  setValues(obj) {
    Object.keys(obj).forEach(key => {
      let child = this.getChild([key, 0]);
      if (!child) {
        const nodeDefinition = this.constructor.getChildNodeDefinition(key);
        if (nodeDefinition) {
          child = nodeDefinition.model.create();
          this.addChild(key, child);
        }
      }
      if (child) {
        child.setValue(obj[key]);
      }
    });
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
    this.setValue('');
  }
  setValue(value) {
    this.value = value;
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
  setValue(value) {
    this.value = parseFloat(value);
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
  setValue(value) {
    this.value = parseInt(value, 10);
  }
}