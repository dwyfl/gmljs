import {
  GMLNodeDefinition,
  GMLNodeName,
  GMLNodeValue,
  GMLParsedNode,
} from "../../types";
import { createGmlNodeFromTagName } from "../../util";
import { GMLLeafNodeParent } from "../leaf/parent";

export class GMLPoint extends GMLLeafNodeParent {
  init(
    data?: GMLParsedNode,
    defaultValues?: Partial<Record<GMLNodeName, GMLNodeValue>>
  ) {
    super.init(data);
    /**
     * Convert <time> to <t>.
     *
     * The spec allows for the <time> tags to exist both under <client>
     * (as a unix timestamp) and under <point> (as a float timing value).
     *
     * This is the only place in the spec where tags are different
     * depending on parent node context, so just do this for now.
     **/
    const timeChild = this.getChild(GMLNodeName.POINT_TIME);
    if (timeChild) {
      if (!this.hasChild(GMLNodeName.POINT_T)) {
        const tChild = createGmlNodeFromTagName(GMLNodeName.POINT_T);
        tChild.setValue(timeChild.getValue());
        this.addChild(GMLNodeName.POINT_T, tChild);
      }
      this.removeChild(GMLNodeName.POINT_TIME);
    }
    if (!data && defaultValues) {
      this.setValues(defaultValues);
    }
  }
  get values() {
    const result: Partial<Record<GMLNodeName, GMLNodeValue>> = (<GMLNodeName[]>(
      Object.keys(this.children)
    )).reduce(
      (obj, key) => ({
        ...obj,
        [key]: this.getChild(key)?.getValue(),
      }),
      {}
    );
    return result;
  }
  getT() {
    const { t } = this.values;
    return <number | undefined>t;
  }
  getXYZ() {
    const { x = 0, y = 0, z = 0 } = this.values;
    return <[number, number, number]>[x, y, z];
  }
}

export const GMLPointDefinition: GMLNodeDefinition = {
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

export default GMLPointDefinition;
