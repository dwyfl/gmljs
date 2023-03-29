import { GMLNodeDefinition, GMLNodeName, GMLNodeValue, GMLParsedNode } from "../../types";
import { createGmlNodeFromTagName } from "../../util";
import { GMLLeafNodeParent } from "../leaf/parent";

export class GMLPoint extends GMLLeafNodeParent {
  init(data?: GMLParsedNode) {
    super.init(data)
    // Convert <time> to <t>
    const timeChild = this.getChild(GMLNodeName.POINT_TIME);
    if (timeChild) {
      if (!this.hasChild(GMLNodeName.POINT_T)) {
        const tChild = createGmlNodeFromTagName(GMLNodeName.POINT_T);
        tChild.setValue(timeChild.getValue());
        this.addChild(GMLNodeName.POINT_T, tChild);
      }
      this.removeChild(GMLNodeName.POINT_TIME);
    }
  }
  get values() {
    const result: Partial<Record<GMLNodeName, GMLNodeValue>> =
      (<GMLNodeName[]>Object.keys(this.children)).reduce((obj, key) => ({
        ...obj,
        [key]: this.getChild(key)?.getValue(),
      }), {});
    return result;
  }
  getT() {
    const { t } = this.values;
    return <number | undefined>t;
  }
  getXYZ() {
    const { x = 0, y = 0, z = 0 } = this.values;
    return <number[]>[ x, y, z ];
  }
}

const definition: GMLNodeDefinition = {
  name: GMLNodeName.POINT,
  model: GMLPoint,
  attributes: [],
  children: [
    { name: GMLNodeName.POINT_X, required: true, initDefault: true },
    { name: GMLNodeName.POINT_Y, required: true, initDefault: true },
    { name: GMLNodeName.POINT_Z, initDefault: true },
    GMLNodeName.POINT_T,
    GMLNodeName.POINT_TIME,
    GMLNodeName.PRESSURE,
    GMLNodeName.ROTATION,
    GMLNodeName.UNIT,
    GMLNodeName.DIRECTION,
  ],
};

export default definition;
