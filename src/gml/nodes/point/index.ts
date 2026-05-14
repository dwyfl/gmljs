import {
  type GMLNodeDefinition,
  GMLNodeName,
  type GMLNodeValue,
  type GMLParsedNode,
} from "../../types.ts";
import { GMLTime } from "../client/settings.ts";
import { GMLLeafNodeParent } from "../leaf/parent.ts";
import type { GMLPointX, GMLPointY, GMLPointZ } from "./points.ts";

export abstract class GML3DPoint extends GMLLeafNodeParent {
  init(data?: GMLParsedNode, defaultValues?: Partial<Record<GMLNodeName, GMLNodeValue>>) {
    super.init(data);
    // Set defaults after parsing
    // When parsing data: overwrite=false so parsed values aren't replaced
    // When no data: overwrite=true so defaults override initialized children
    this.setValues(defaultValues, !data);
  }

  getXYZ() {
    const x = this.getChild<GMLPointX>(GMLNodeName.POINT_X)?.getFloatValue();
    const y = this.getChild<GMLPointY>(GMLNodeName.POINT_Y)?.getFloatValue();
    const z = this.getChild<GMLPointZ>(GMLNodeName.POINT_Z)?.getFloatValue();
    return [x ?? 0, y ?? 0, z ?? 0];
  }
}
export class GMLPoint extends GML3DPoint {
  init(data?: GMLParsedNode, defaultValues?: Partial<Record<GMLNodeName, GMLNodeValue>>) {
    super.init(data, defaultValues);
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
      {},
    );
    return result;
  }
  getT() {
    const { t } = this.values;
    return typeof t === "number" ? t : undefined;
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
