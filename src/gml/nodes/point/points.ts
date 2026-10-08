import { GMLNodeName } from "../../types.ts";
import { createDefinition } from "../../util/definition.ts";
import { GMLLeafNode } from "../leaf/index.ts";
import { GMLFloatNode } from "../leaf/float.ts";

export const GMLPointXDefinition = createDefinition(GMLNodeName.POINT_X, GMLFloatNode);
export const GMLPointYDefinition = createDefinition(GMLNodeName.POINT_Y, GMLFloatNode);
export const GMLPointZDefinition = createDefinition(GMLNodeName.POINT_Z, GMLFloatNode);
export const GMLPointTDefinition = createDefinition(GMLNodeName.POINT_T, GMLFloatNode);
/** Float timing value. Note that <time> under <client> is a unix timestamp; see GMLTimeDefinition. */
export const GMLPointTimeDefinition = createDefinition(GMLNodeName.POINT_TIME, GMLFloatNode);
export const GMLPointPressureDefinition = createDefinition(GMLNodeName.PRESSURE, GMLFloatNode);
export const GMLPointRotationDefinition = createDefinition(GMLNodeName.ROTATION, GMLFloatNode);
export const GMLPointUnitDefinition = createDefinition(GMLNodeName.UNIT, GMLLeafNode);
