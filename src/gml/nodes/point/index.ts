import {
  GMLNodeDefinition,
  GMLNodeName,
  GMLNodeValue,
  GMLParsedNode,
} from "../../types";
import { GMLTime } from "../client/settings";
import { GMLLeafNodeParent } from "../leaf/parent";

export class GMLPoint extends GMLLeafNodeParent {
  init(
    data?: GMLParsedNode,
    defaultValues?: Partial<Record<GMLNodeName, GMLNodeValue>>
  ) {
    super.init(data);
    // Set defaults after parsing
    // When parsing data: overwrite=false so parsed values aren't replaced
    // When no data: overwrite=true so defaults override initialized children
    this.setValues(defaultValues, !data);
    /**
     * Convert <time> to <t>.
     *
     * The spec allows for the <time> tags to exist both under <client>
     * (as a unix timestamp) and under <point> (as a float timing value).
     *
     * This is the only place in the spec where tags are different
     * depending on parent node context, so just do this for now.
     **/
    const timeChild = this.getChild<GMLTime>(GMLNodeName.POINT_TIME);
    if (timeChild) {
      this.setValues({ t: timeChild.floatValue }, false);
      this.removeChild(GMLNodeName.POINT_TIME);
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
    return typeof t === "number" ? t : undefined;
  }
  getXYZ() {
    const { x, y, z } = this.values;
    return [
      typeof x === "number" ? x : 0,
      typeof y === "number" ? y : 0,
      typeof z === "number" ? z : 0,
    ];
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
