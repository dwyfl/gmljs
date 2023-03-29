import { GMLNodeDefinition, GMLNodeName } from "../../types";
import { GMLLeafNode } from "../leaf";
import { GMLFloatNode } from "../leaf/float";
import { createDefinition } from "../../util";

export class GMLPointX extends GMLFloatNode {}
export const GMLPointXDefinition: GMLNodeDefinition = createDefinition(GMLNodeName.POINT_X, GMLPointX);

export class GMLPointY extends GMLFloatNode {}
export const GMLPointYDefinition: GMLNodeDefinition = createDefinition(GMLNodeName.POINT_Y, GMLPointY);

export class GMLPointZ extends GMLFloatNode {}
export const GMLPointZDefinition: GMLNodeDefinition = createDefinition(GMLNodeName.POINT_Z, GMLPointZ);

export class GMLPointT extends GMLFloatNode {}
export const GMLPointTDefinition: GMLNodeDefinition = createDefinition(GMLNodeName.POINT_T, GMLPointT);

export class GMLPointTime extends GMLFloatNode {}
export const GMLPointTimeDefinition: GMLNodeDefinition = createDefinition(GMLNodeName.POINT_TIME, GMLPointTime);

export class GMLPointPressure extends GMLFloatNode {}
export const GMLPointPressureDefinition: GMLNodeDefinition = createDefinition(GMLNodeName.PRESSURE, GMLPointPressure);

export class GMLPointRotation extends GMLFloatNode {}
export const GMLPointRotationDefinition: GMLNodeDefinition = createDefinition(GMLNodeName.ROTATION, GMLPointRotation);

export class GMLPointUnit extends GMLLeafNode {}
export const GMLPointUnitDefinition: GMLNodeDefinition = createDefinition(GMLNodeName.UNIT, GMLPointUnit);
