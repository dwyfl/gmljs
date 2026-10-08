import type { GMLRGBA } from "./nodes/point/color.ts";

// Plain-data view of a GML document, as returned by `toData()`.
// Optional fields are absent (not undefined) when the document doesn't have them.

type XYZ = [x: number, y: number, z: number];

export type GMLPointData = {
  x: number;
  y: number;
  z: number;
  t?: number;
  pressure?: number;
  rotation?: number;
};

export type GMLBrushData = {
  width?: number;
  /** 0–255 components, as in the spec. */
  color?: GMLRGBA;
  uniqueStyleId?: string;
  dripAmount?: number;
  dripSpeed?: number;
  dripVecRelativeToUp?: XYZ;
};

export type GMLStrokeData = {
  isDrawing: boolean;
  brush?: GMLBrushData;
  points: GMLPointData[];
};

export type GMLDrawingData = {
  strokes: GMLStrokeData[];
};

export type GMLClientData = {
  name?: string;
  version?: string;
  username?: string;
  permalink?: string;
  keywords?: string;
  uniqueKey?: string;
  ip?: string;
  /** Unix timestamp. */
  time?: number;
  location?: { lat: number; lon: number };
};

export type GMLEnvironmentData = {
  screenBounds?: [width: number, height: number];
  up?: XYZ;
  offset?: XYZ;
  rotation?: XYZ;
  origin?: XYZ;
  realScale?: XYZ;
  audio?: string;
  background?: string;
};

export type GMLTagData = {
  client?: GMLClientData;
  environment?: GMLEnvironmentData;
  drawings: GMLDrawingData[];
};

export type GMLData = {
  spec?: string;
  tags: GMLTagData[];
};

/** Removes keys whose value is undefined, so optional fields are absent. */
export const compact = <T extends object>(value: T): T => {
  for (const [key, field] of Object.entries(value)) {
    if (field === undefined) {
      delete (value as Record<string, unknown>)[key];
    }
  }
  return value;
};
