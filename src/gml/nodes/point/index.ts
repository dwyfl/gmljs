import {
  type GMLNodeDefinition,
  GMLNodeName,
  type GMLNodeValue,
  type GMLParsedNode,
} from "../../types.ts";
import { GMLLeafNodeParent } from "../leaf/parent.ts";
import { GMLPointTimeDefinition } from "./points.ts";

export abstract class GML3DPoint extends GMLLeafNodeParent {
  override init(data?: GMLParsedNode, defaultValues?: Partial<Record<GMLNodeName, GMLNodeValue>>) {
    super.init(data);
    // Set defaults after parsing
    // When parsing data: overwrite=false so parsed values aren't replaced
    // When no data: overwrite=true so defaults override initialized children
    this.setValues(defaultValues, !data);
  }

  getXYZ(): [x: number, y: number, z: number] {
    const x = this.getChild(GMLNodeName.POINT_X)?.getFloatValue();
    const y = this.getChild(GMLNodeName.POINT_Y)?.getFloatValue();
    const z = this.getChild(GMLNodeName.POINT_Z)?.getFloatValue();
    return [x ?? 0, y ?? 0, z ?? 0];
  }
}
export class GMLPoint extends GML3DPoint {
  override init(data?: GMLParsedNode, defaultValues?: Partial<Record<GMLNodeName, GMLNodeValue>>) {
    super.init(data, defaultValues);
    /**
     * Convert <time> to <t>.
     *
     * The spec allows for the <time> tags to exist both under <client>
     * (as a unix timestamp) and under <point> (as a float timing value).
     * GMLPointDefinition maps <time> to GMLPointTime, so the value is a float.
     **/
    const time = this.getChild(GMLNodeName.POINT_TIME)?.getValue();
    if (time !== undefined) {
      if (typeof time === "number") {
        this.setValues({ t: time }, false);
      }
      this.removeChild(GMLNodeName.POINT_TIME);
    }
  }
  get values() {
    const result: Partial<Record<GMLNodeName, GMLNodeValue>> = {};
    for (const name of Object.keys(this.children) as GMLNodeName[]) {
      const value = this.getChild(name)?.getValue();
      if (value !== undefined) {
        result[name] = value;
      }
    }
    return result;
  }
  getT() {
    return this.getChild(GMLNodeName.POINT_T)?.getFloatValue();
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
    { name: GMLNodeName.POINT_TIME, definition: GMLPointTimeDefinition },
    GMLNodeName.PRESSURE,
    GMLNodeName.ROTATION,
    GMLNodeName.UNIT,
    GMLNodeName.DIRECTION,
  ],
};
