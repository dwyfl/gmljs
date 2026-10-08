import { GMLNodeName, type GMLNodeValue, type GMLParsedNode } from "../../types.ts";
import { GMLLeafNodeParent } from "../leaf/parent.ts";

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
