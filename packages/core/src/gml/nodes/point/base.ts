import { GMLNodeName } from "../../types.ts";
import { GMLLeafNodeParent } from "../leaf/parent.ts";

/** A node with <x>, <y> and optional <z> children. */
export class GML3DPoint extends GMLLeafNodeParent {
  getXYZ(): [x: number, y: number, z: number] {
    const x = this.getChild(GMLNodeName.POINT_X)?.getFloatValue();
    const y = this.getChild(GMLNodeName.POINT_Y)?.getFloatValue();
    const z = this.getChild(GMLNodeName.POINT_Z)?.getFloatValue();
    return [x ?? 0, y ?? 0, z ?? 0];
  }
}
