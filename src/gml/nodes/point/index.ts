import {
  type GMLNodeDefinition,
  GMLNodeName,
  type GMLNodeValue,
  type GMLParsedNode,
} from "../../types.ts";
import { GML3DPoint } from "./base.ts";
import { GMLDirectionDefinition } from "./direction.ts";
import {
  GMLPointPressureDefinition,
  GMLPointRotationDefinition,
  GMLPointTDefinition,
  GMLPointTimeDefinition,
  GMLPointUnitDefinition,
  GMLPointXDefinition,
  GMLPointYDefinition,
  GMLPointZDefinition,
} from "./points.ts";

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
    { definition: GMLPointXDefinition, required: true, initDefault: true },
    { definition: GMLPointYDefinition, required: true, initDefault: true },
    { definition: GMLPointZDefinition, initDefault: true },
    GMLPointTDefinition,
    GMLPointTimeDefinition,
    GMLPointPressureDefinition,
    GMLPointRotationDefinition,
    GMLPointUnitDefinition,
    GMLDirectionDefinition,
  ],
};
