import { parseCssColor, type RgbaColor } from "../color/parse.ts";
import { Path, type FillRule } from "../path/path.ts";
import { PixelBuffer } from "../pixels/pixel-buffer.ts";
import { AnalyticRasterizer } from "../raster/analytic-rasterizer.ts";
import { Stroker, type LineCap, type LineJoin } from "../stroke/stroker.ts";

const DEFAULT_COLOR: RgbaColor = { r: 0, g: 0, b: 0, a: 255 };

export class CanvasContext2D {
  private buffer: PixelBuffer;
  private fillColor: RgbaColor = DEFAULT_COLOR;
  private fillStyleValue = "#000000";
  private strokeColor: RgbaColor = DEFAULT_COLOR;
  private strokeStyleValue = "#000000";
  private lineWidthValue = 1;
  private lineCapValue: LineCap = "butt";
  private lineJoinValue: LineJoin = "miter";
  private miterLimitValue = 10;
  private readonly path = new Path();
  private readonly rasterizer = new AnalyticRasterizer();
  private readonly stroker = new Stroker();

  constructor(buffer: PixelBuffer) {
    this.buffer = buffer;
  }

  get fillStyle(): string {
    return this.fillStyleValue;
  }

  set fillStyle(value: string) {
    const color = parseCssColor(value);
    if (color) {
      this.fillColor = color;
      this.fillStyleValue = value.trim();
    }
  }

  get strokeStyle(): string {
    return this.strokeStyleValue;
  }

  set strokeStyle(value: string) {
    const color = parseCssColor(value);
    if (color) {
      this.strokeColor = color;
      this.strokeStyleValue = value.trim();
    }
  }

  get lineWidth(): number {
    return this.lineWidthValue;
  }

  set lineWidth(value: number) {
    if (Number.isFinite(value) && value > 0) {
      this.lineWidthValue = value;
    }
  }

  get lineCap(): LineCap {
    return this.lineCapValue;
  }

  set lineCap(value: LineCap) {
    if (value === "butt" || value === "round" || value === "square") {
      this.lineCapValue = value;
    }
  }

  get lineJoin(): LineJoin {
    return this.lineJoinValue;
  }

  set lineJoin(value: LineJoin) {
    if (value === "bevel" || value === "miter" || value === "round") {
      this.lineJoinValue = value;
    }
  }

  get miterLimit(): number {
    return this.miterLimitValue;
  }

  set miterLimit(value: number) {
    if (Number.isFinite(value) && value > 0) {
      this.miterLimitValue = value;
    }
  }

  clearRect(x: number, y: number, width: number, height: number): void {
    this.buffer.clearRect(x, y, width, height);
  }

  fillRect(x: number, y: number, width: number, height: number): void {
    this.buffer.fillRect(x, y, width, height, this.fillColor);
  }

  strokeRect(x: number, y: number, width: number, height: number): void {
    if (![x, y, width, height].every(Number.isFinite)) {
      return;
    }
    this.strokeSubpaths([
      {
        points: [x, y, x + width, y, x + width, y + height, x, y + height],
        closed: true,
        hasSegments: true,
      },
    ]);
  }

  beginPath(): void {
    this.path.reset();
  }

  closePath(): void {
    this.path.closePath();
  }

  moveTo(x: number, y: number): void {
    this.path.moveTo(x, y);
  }

  lineTo(x: number, y: number): void {
    this.path.lineTo(x, y);
  }

  rect(x: number, y: number, width: number, height: number): void {
    this.path.rect(x, y, width, height);
  }

  arc(
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    counterclockwise = false,
  ): void {
    this.path.arc(x, y, radius, startAngle, endAngle, counterclockwise);
  }

  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void {
    this.path.quadraticCurveTo(cpx, cpy, x, y);
  }

  bezierCurveTo(
    cp1x: number,
    cp1y: number,
    cp2x: number,
    cp2y: number,
    x: number,
    y: number,
  ): void {
    this.path.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
  }

  fill(fillRule: FillRule = "nonzero"): void {
    if (fillRule !== "nonzero" && fillRule !== "evenodd") {
      throw new TypeError(`Unknown fill rule: ${String(fillRule)}`);
    }
    if (!this.path.hasSegments()) {
      return;
    }
    this.rasterizer.fill(this.path.flatten(), this.buffer, this.fillColor, fillRule);
  }

  stroke(): void {
    if (!this.path.hasSegments()) {
      return;
    }
    this.strokeSubpaths(this.path.flatten());
  }

  /** @internal Used by Canvas when a dimension assignment resets its bitmap and state. */
  reset(buffer: PixelBuffer): void {
    this.buffer = buffer;
    this.fillColor = DEFAULT_COLOR;
    this.fillStyleValue = "#000000";
    this.strokeColor = DEFAULT_COLOR;
    this.strokeStyleValue = "#000000";
    this.lineWidthValue = 1;
    this.lineCapValue = "butt";
    this.lineJoinValue = "miter";
    this.miterLimitValue = 10;
    this.path.reset();
  }

  private strokeSubpaths(subpaths: ReturnType<Path["flatten"]>): void {
    let hasDrawableStroke = false;
    for (const subpath of subpaths) {
      if (
        subpath.points.length >= 4 ||
        (subpath.hasSegments &&
          !subpath.closed &&
          subpath.points.length === 2 &&
          this.lineCapValue !== "butt")
      ) {
        hasDrawableStroke = true;
        break;
      }
    }
    if (!hasDrawableStroke) {
      return;
    }

    const outline = this.stroker.stroke(subpaths, {
      lineWidth: this.lineWidthValue,
      lineCap: this.lineCapValue,
      lineJoin: this.lineJoinValue,
      miterLimit: this.miterLimitValue,
    });
    this.rasterizer.fill(outline, this.buffer, this.strokeColor, "nonzero");
  }
}
