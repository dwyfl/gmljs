import { GMLNodeDefinition, GMLNodeName } from './types';
import GMLBrush from './nodes/brush';
import GMLClient from './nodes/client';
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
} from './nodes/brush/settings';
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
} from './nodes/client/settings';
import GMLDocument from './nodes/document';
import GMLDrawing from './nodes/drawing';
import GMLEnvironment from './nodes/environment';
import {
  GMLEnvOffsetDefinition as GMLEnvOffset,
  GMLEnvRotationDefinition as GMLEnvRotation,
  GMLEnvOriginDefinition as GMLEnvOrigin,
  GMLEnvRealScareDefinition as GMLEnvRealScare,
  GMLEnvAudioDefinition as GMLEnvAudio,
  GMLEnvBackgroundDefinition as GMLEnvBackground,
  GMLEnvUpDefinition as GMLEnvUp,
  GMLEnvScreenBoundsDefinition as GMLEnvScreenBounds,
} from './nodes/environment/settings';
import GMLPoint from './nodes/point';
import GMLColor, {
  GMLColorRDefinition as GMLColorR,
  GMLColorGDefinition as GMLColorG,
  GMLColorBDefinition as GMLColorB,
  GMLColorADefinition as GMLColorA,
} from './nodes/point/color';
import GMLDirection from './nodes/point/direction';
import {
  GMLPointXDefinition as GMLPointX,
  GMLPointYDefinition as GMLPointY,
  GMLPointZDefinition as GMLPointZ,
  GMLPointTDefinition as GMLPointT,
  GMLPointTimeDefinition as GMLPointTime,
  GMLPointPressureDefinition as GMLPointPressure,
  GMLPointRotationDefinition as GMLPointRotation,
  GMLPointUnitDefinition as GMLPointUnit,
} from './nodes/point/points';
import GMLRoot from './nodes/root';
import GMLStroke from './nodes/stroke';
import GMLStrokeInfo from './nodes/stroke/info';
import GMLStrokeInfoCurved from './nodes/stroke/curved';
import GMLTag from './nodes/tag';
import GMLHeader from './nodes/header';

const gmlNodeClassMap: Record<GMLNodeName, GMLNodeDefinition> = {
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
  [GMLNodeName.ENVIRONMENT_REAL_SCALE]: GMLEnvRealScare,
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

export const getGMLNodeDefinition = (nodeName: GMLNodeName): GMLNodeDefinition => gmlNodeClassMap[nodeName];

export default gmlNodeClassMap;