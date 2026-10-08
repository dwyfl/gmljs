import type { GMLNodeTypeMap } from "./type-map.ts";
import { GMLNodeName, type GMLNodeDefinition } from "./types.ts";
import { GMLBrushDefinition as GMLBrush } from "./nodes/brush/index.ts";
import { GMLClientDefinition as GMLClient } from "./nodes/client/index.ts";
import {
  GMLBrushModeDefinition as GMLBrushMode,
  GMLBrushSpecDefinition as GMLBrushSpec,
  GMLBrushWidthDefinition as GMLBrushWidth,
  GMLBrushSpeedToWidthRatioDefinition as GMLBrushSpeedToWidthRatio,
  GMLBrushUniqueStyleIdDefinition as GMLBrushUniqueStyleId,
  GMLBrushLayerAbsoluteDefinition as GMLBrushLayerAbsolute,
  GMLBrushLayerRelativeDefinition as GMLBrushLayerRelative,
  GMLBrushDripAmountDefinition as GMLBrushDripAmount,
  GMLBrushDripSpeedDefinition as GMLBrushDripSpeed,
  GMLBrushDripVecRelativeToUpDefinition as GMLBrushDripVecRelativeToUp,
} from "./nodes/brush/settings.ts";
import {
  GMLClientIpDefinition as GMLClientIp,
  GMLClientKeywordsDefinition as GMLClientKeywords,
  GMLClientNameDefinition as GMLClientName,
  GMLClientPermalinkDefinition as GMLClientPermalink,
  GMLClientUniqueKeyDefinition as GMLClientUniqueKey,
  GMLClientUsernameDefinition as GMLClientUsername,
  GMLClientVersionDefinition as GMLClientVersion,
  GMLLocationDefinition as GMLLocation,
  GMLLocationLatitudeDefinition as GMLLocationLatitude,
  GMLLocationLongitudeDefinition as GMLLocationLongitude,
  GMLTimeDefinition as GMLTime,
} from "./nodes/client/settings.ts";
import GMLDocument from "./nodes/document/index.ts";
import GMLDrawing from "./nodes/drawing/index.ts";
import GMLEnvironment from "./nodes/environment/index.ts";
import {
  GMLEnvOffsetDefinition as GMLEnvOffset,
  GMLEnvRotationDefinition as GMLEnvRotation,
  GMLEnvOriginDefinition as GMLEnvOrigin,
  GMLEnvRealScaleDefinition as GMLEnvRealScale,
  GMLEnvAudioDefinition as GMLEnvAudio,
  GMLEnvBackgroundDefinition as GMLEnvBackground,
  GMLEnvUpDefinition as GMLEnvUp,
  GMLEnvScreenBoundsDefinition as GMLEnvScreenBounds,
} from "./nodes/environment/settings.ts";
import { GMLPointDefinition as GMLPoint } from "./nodes/point/index.ts";
import {
  GMLColorDefinition as GMLColor,
  GMLColorRDefinition as GMLColorR,
  GMLColorGDefinition as GMLColorG,
  GMLColorBDefinition as GMLColorB,
  GMLColorADefinition as GMLColorA,
} from "./nodes/point/color.ts";
import { GMLDirectionDefinition as GMLDirection } from "./nodes/point/direction.ts";
import {
  GMLPointXDefinition as GMLPointX,
  GMLPointYDefinition as GMLPointY,
  GMLPointZDefinition as GMLPointZ,
  GMLPointTDefinition as GMLPointT,
  GMLPointPressureDefinition as GMLPointPressure,
  GMLPointRotationDefinition as GMLPointRotation,
  GMLPointUnitDefinition as GMLPointUnit,
} from "./nodes/point/points.ts";
import GMLRoot from "./nodes/root/index.ts";
import GMLStroke from "./nodes/stroke/index.ts";
import GMLStrokeInfo from "./nodes/stroke/info.ts";
import GMLStrokeInfoCurved from "./nodes/stroke/curved.ts";
import GMLTag from "./nodes/tag/index.ts";
import GMLHeader from "./nodes/header/index.ts";

/** The definition used for each tag name; the model must match GMLNodeTypeMap. */
const gmlNodeClassMap: { [N in GMLNodeName]: GMLNodeDefinition<GMLNodeTypeMap[N]> } = {
  [GMLNodeName.BRUSH]: GMLBrush,
  [GMLNodeName.BRUSH_MODE]: GMLBrushMode,
  [GMLNodeName.BRUSH_SPEC]: GMLBrushSpec,
  [GMLNodeName.BRUSH_WIDTH]: GMLBrushWidth,
  [GMLNodeName.BRUSH_SPEED_TO_WIDTH_RATIO]: GMLBrushSpeedToWidthRatio,
  [GMLNodeName.BRUSH_DRIP_AMOUNT]: GMLBrushDripAmount,
  [GMLNodeName.BRUSH_DRIP_SPEED]: GMLBrushDripSpeed,
  [GMLNodeName.BRUSH_DRIP_VEC_RELATIVE_TO_UP]: GMLBrushDripVecRelativeToUp,
  [GMLNodeName.BRUSH_LAYER_ABSOLUTE]: GMLBrushLayerAbsolute,
  [GMLNodeName.BRUSH_LAYER_RELATIVE]: GMLBrushLayerRelative,
  [GMLNodeName.BRUSH_UNIQUE_STYLE_ID]: GMLBrushUniqueStyleId,
  [GMLNodeName.CLIENT]: GMLClient,
  [GMLNodeName.CLIENT_IP]: GMLClientIp,
  [GMLNodeName.CLIENT_NAME]: GMLClientName,
  [GMLNodeName.CLIENT_KEYWORDS]: GMLClientKeywords,
  [GMLNodeName.CLIENT_PERMALINK]: GMLClientPermalink,
  [GMLNodeName.CLIENT_UNIQUEKEY]: GMLClientUniqueKey,
  [GMLNodeName.CLIENT_USERNAME]: GMLClientUsername,
  [GMLNodeName.CLIENT_VERSION]: GMLClientVersion,
  [GMLNodeName.CLIENT_LOCATION]: GMLLocation,
  [GMLNodeName.CLIENT_LOCATION_LAT]: GMLLocationLatitude,
  [GMLNodeName.CLIENT_LOCATION_LON]: GMLLocationLongitude,
  [GMLNodeName.CLIENT_TIME]: GMLTime,
  [GMLNodeName.COLOR]: GMLColor,
  [GMLNodeName.COLOR_R]: GMLColorR,
  [GMLNodeName.COLOR_G]: GMLColorG,
  [GMLNodeName.COLOR_B]: GMLColorB,
  [GMLNodeName.COLOR_A]: GMLColorA,
  [GMLNodeName.DIRECTION]: GMLDirection,
  [GMLNodeName.DOCUMENT]: GMLDocument,
  [GMLNodeName.DRAWING]: GMLDrawing,
  [GMLNodeName.ENVIRONMENT]: GMLEnvironment,
  [GMLNodeName.ENVIRONMENT_OFFSET]: GMLEnvOffset,
  [GMLNodeName.ENVIRONMENT_ROTATION]: GMLEnvRotation,
  [GMLNodeName.ENVIRONMENT_UP]: GMLEnvUp,
  [GMLNodeName.ENVIRONMENT_SCREEN_BOUNDS]: GMLEnvScreenBounds,
  [GMLNodeName.ENVIRONMENT_ORIGIN]: GMLEnvOrigin,
  [GMLNodeName.ENVIRONMENT_REAL_SCALE]: GMLEnvRealScale,
  [GMLNodeName.ENVIRONMENT_AUDIO]: GMLEnvAudio,
  [GMLNodeName.ENVIRONMENT_BACKGROUND]: GMLEnvBackground,
  [GMLNodeName.HEADER]: GMLHeader,
  [GMLNodeName.POINT]: GMLPoint,
  [GMLNodeName.POINT_T]: GMLPointT,
  [GMLNodeName.POINT_X]: GMLPointX,
  [GMLNodeName.POINT_Y]: GMLPointY,
  [GMLNodeName.POINT_Z]: GMLPointZ,
  [GMLNodeName.PRESSURE]: GMLPointPressure,
  [GMLNodeName.ROOT]: GMLRoot,
  [GMLNodeName.ROTATION]: GMLPointRotation,
  [GMLNodeName.STROKE]: GMLStroke,
  [GMLNodeName.STROKE_INFO]: GMLStrokeInfo,
  [GMLNodeName.STROKE_INFO_CURVED]: GMLStrokeInfoCurved,
  [GMLNodeName.TAG]: GMLTag,
  [GMLNodeName.UNIT]: GMLPointUnit,
};

export const getGMLNodeDefinition = <N extends GMLNodeName>(
  nodeName: N,
): GMLNodeDefinition<GMLNodeTypeMap[N]> => gmlNodeClassMap[nodeName];

export default gmlNodeClassMap;
