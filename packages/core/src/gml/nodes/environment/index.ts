import { compact, type GMLEnvironmentData } from "../../data.ts";
import { GMLNode } from "../../node.ts";
import { type GMLNodeDefinition, GMLNodeName } from "../../types.ts";
import type { GML3DPoint } from "../point/base.ts";
import {
  GMLEnvAudioDefinition,
  GMLEnvBackgroundDefinition,
  GMLEnvOffsetDefinition,
  GMLEnvOriginDefinition,
  GMLEnvRealScaleDefinition,
  GMLEnvRotationDefinition,
  GMLEnvScreenBoundsDefinition,
  GMLEnvUpDefinition,
} from "./settings.ts";

export class GMLEnvironment extends GMLNode {
  getUp() {
    return this.getChild(GMLNodeName.ENVIRONMENT_UP)?.getXYZ();
  }
  getScreenBounds(): [width: number, height: number] | undefined {
    const bounds = this.getChild(GMLNodeName.ENVIRONMENT_SCREEN_BOUNDS)?.getXYZ();
    return bounds && [bounds[0], bounds[1]];
  }
  getOffset() {
    return this.getChild(GMLNodeName.ENVIRONMENT_OFFSET)?.getXYZ();
  }
  getRotation() {
    return this.getChild(GMLNodeName.ENVIRONMENT_ROTATION)?.getXYZ();
  }
  /**
   * Rotates the document's declared orientation clockwise by swinging the <up> vector
   * through the same angle; the renderer already rotates content so <up> points to
   * screen-up, so this change is what actually turns the rendered output. <screenBounds>
   * width/height are swapped for 90/270 so the renderer's existing aspect-fit logic sizes
   * the rotated content correctly. <up>/<screenBounds> are created with gmljs's own
   * defaults first if the document doesn't declare them.
   */
  rotate(degrees: 90 | 180 | 270): void {
    const up = this.getOrCreatePoint(GMLNodeName.ENVIRONMENT_UP);
    const [x, y] = up.getXYZ();
    // `|| 0` turns -0 into 0, so axis-aligned vectors give exact values (see the analogous
    // comment on TagEnvironment.getUpTransform in @gmljs/render).
    const [newX, newY] =
      degrees === 90 ? [y || 0, -x || 0] : degrees === 180 ? [-x || 0, -y || 0] : [-y || 0, x || 0];
    up.setValues({ [GMLNodeName.POINT_X]: newX, [GMLNodeName.POINT_Y]: newY });

    if (degrees !== 180) {
      const screenBounds = this.getOrCreatePoint(GMLNodeName.ENVIRONMENT_SCREEN_BOUNDS);
      const [width, height] = screenBounds.getXYZ();
      screenBounds.setValues({
        [GMLNodeName.POINT_X]: height,
        [GMLNodeName.POINT_Y]: width,
      });
    }
  }
  private getOrCreatePoint(
    name: typeof GMLNodeName.ENVIRONMENT_UP | typeof GMLNodeName.ENVIRONMENT_SCREEN_BOUNDS,
  ): GML3DPoint {
    const existing = this.getChild(name);
    if (existing) {
      return existing;
    }
    const node = this.createChildNode(name) as GML3DPoint;
    this.addChild(name, node);
    return node;
  }
  toData(): GMLEnvironmentData {
    const text = (name: GMLNodeName) => {
      const value = this.getChildValue([name]);
      return value === undefined ? undefined : String(value);
    };
    return compact({
      screenBounds: this.getScreenBounds(),
      up: this.getUp(),
      offset: this.getOffset(),
      rotation: this.getRotation(),
      origin: this.getChild(GMLNodeName.ENVIRONMENT_ORIGIN)?.getXYZ(),
      realScale: this.getChild(GMLNodeName.ENVIRONMENT_REAL_SCALE)?.getXYZ(),
      audio: text(GMLNodeName.ENVIRONMENT_AUDIO),
      background: text(GMLNodeName.ENVIRONMENT_BACKGROUND),
    });
  }
}

export const GMLEnvironmentDefinition: GMLNodeDefinition<GMLEnvironment> = {
  name: GMLNodeName.ENVIRONMENT,
  model: GMLEnvironment,
  attributes: [],
  children: [
    { definition: GMLEnvUpDefinition, initDefault: true },
    { definition: GMLEnvScreenBoundsDefinition, initDefault: true },
    GMLEnvOffsetDefinition,
    GMLEnvRotationDefinition,
    GMLEnvOriginDefinition,
    GMLEnvRealScaleDefinition,
    GMLEnvAudioDefinition,
    GMLEnvBackgroundDefinition,
  ],
};

export default GMLEnvironmentDefinition;
