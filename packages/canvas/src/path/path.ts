export type FillRule = "nonzero" | "evenodd";

export interface FlattenedSubpath {
  readonly points: number[];
  readonly closed: boolean;
  readonly hasSegments: boolean;
}

type Segment = LineSegment | QuadraticSegment | CubicSegment | ArcSegment;

interface LineSegment {
  readonly kind: "line";
  readonly x: number;
  readonly y: number;
}

interface QuadraticSegment {
  readonly kind: "quadratic";
  readonly cpx: number;
  readonly cpy: number;
  readonly x: number;
  readonly y: number;
}

interface CubicSegment {
  readonly kind: "cubic";
  readonly cp1x: number;
  readonly cp1y: number;
  readonly cp2x: number;
  readonly cp2y: number;
  readonly x: number;
  readonly y: number;
}

interface ArcSegment {
  readonly kind: "arc";
  readonly x: number;
  readonly y: number;
  readonly radius: number;
  readonly startAngle: number;
  readonly sweep: number;
}

interface Subpath {
  readonly startX: number;
  readonly startY: number;
  readonly segments: Segment[];
  closed: boolean;
}

const FLATNESS = 0.125;
const MAX_CURVE_DEPTH = 16;
const TAU = Math.PI * 2;
// Caps the work a single arc can cause. A full turn reaches this at a radius of
// about 1.7 million pixels, far outside any canvas, so visible arcs are unaffected.
const MAX_SEGMENTS_PER_TURN = 8192;

/**
 * Number of line segments needed to flatten an arc of `radius` spanning `sweep` radians
 * so that no chord strays more than `flatness` from the true curve.
 */
export function arcSegmentCount(radius: number, sweep: number, flatness = FLATNESS): number {
  // 2 * acos(1 - flatness / radius), rewritten so it does not cancel to 0 for large radii.
  const maximumAngle =
    radius <= flatness
      ? Math.PI / 2
      : Math.min(Math.PI / 2, 4 * Math.asin(Math.sqrt(flatness / (2 * radius))));
  const cap = Math.max(1, Math.ceil((MAX_SEGMENTS_PER_TURN * Math.abs(sweep)) / TAU));
  return Math.max(1, Math.min(cap, Math.ceil(Math.abs(sweep) / maximumAngle)));
}

export class Path {
  private readonly subpaths: Subpath[] = [];
  private current: Subpath | undefined;
  private currentX = 0;
  private currentY = 0;

  reset(): void {
    this.subpaths.length = 0;
    this.current = undefined;
  }

  hasSegments(): boolean {
    for (const subpath of this.subpaths) {
      if (subpath.segments.length > 0) {
        return true;
      }
    }
    return false;
  }

  moveTo(x: number, y: number): void {
    if (!finite(x, y)) {
      return;
    }
    this.startSubpath(x, y);
  }

  lineTo(x: number, y: number): void {
    if (!finite(x, y)) {
      return;
    }
    if (!this.ensureCurrent()) {
      this.startSubpath(x, y);
      return;
    }
    this.current!.segments.push({ kind: "line", x, y });
    this.currentX = x;
    this.currentY = y;
  }

  closePath(): void {
    if (!this.current || this.current.closed) {
      return;
    }
    this.current.closed = true;
    this.currentX = this.current.startX;
    this.currentY = this.current.startY;
  }

  rect(x: number, y: number, width: number, height: number): void {
    if (!finite(x, y, width, height)) {
      return;
    }
    const subpath: Subpath = {
      startX: x,
      startY: y,
      segments: [
        { kind: "line", x: x + width, y },
        { kind: "line", x: x + width, y: y + height },
        { kind: "line", x, y: y + height },
      ],
      closed: true,
    };
    this.subpaths.push(subpath);
    this.current = subpath;
    this.currentX = x;
    this.currentY = y;
  }

  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void {
    if (!finite(cpx, cpy, x, y)) {
      return;
    }
    if (!this.ensureCurrent()) {
      this.startSubpath(cpx, cpy);
    }
    this.current!.segments.push({ kind: "quadratic", cpx, cpy, x, y });
    this.currentX = x;
    this.currentY = y;
  }

  bezierCurveTo(
    cp1x: number,
    cp1y: number,
    cp2x: number,
    cp2y: number,
    x: number,
    y: number,
  ): void {
    if (!finite(cp1x, cp1y, cp2x, cp2y, x, y)) {
      return;
    }
    if (!this.ensureCurrent()) {
      this.startSubpath(cp1x, cp1y);
    }
    this.current!.segments.push({ kind: "cubic", cp1x, cp1y, cp2x, cp2y, x, y });
    this.currentX = x;
    this.currentY = y;
  }

  arc(
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    counterclockwise = false,
  ): void {
    if (!finite(x, y, radius, startAngle, endAngle)) {
      return;
    }
    if (radius < 0) {
      throw new RangeError("arc radius must be non-negative");
    }

    const startX = x + Math.cos(startAngle) * radius;
    const startY = y + Math.sin(startAngle) * radius;
    if (!this.ensureCurrent()) {
      this.startSubpath(startX, startY);
    } else if (this.currentX !== startX || this.currentY !== startY) {
      this.lineTo(startX, startY);
    }

    const rawSweep = endAngle - startAngle;
    let sweep: number;
    if (!counterclockwise && rawSweep >= TAU) {
      sweep = TAU;
    } else if (counterclockwise && rawSweep <= -TAU) {
      sweep = -TAU;
    } else if (!counterclockwise) {
      sweep = ((rawSweep % TAU) + TAU) % TAU;
    } else {
      sweep = -(((-rawSweep % TAU) + TAU) % TAU);
    }

    if (radius > 0 && sweep !== 0) {
      this.current!.segments.push({ kind: "arc", x, y, radius, startAngle, sweep });
      const finalAngle = startAngle + sweep;
      this.currentX = x + Math.cos(finalAngle) * radius;
      this.currentY = y + Math.sin(finalAngle) * radius;
    }
  }

  flatten(): FlattenedSubpath[] {
    const flattened: FlattenedSubpath[] = [];
    for (const subpath of this.subpaths) {
      const points = [subpath.startX, subpath.startY];
      let x = subpath.startX;
      let y = subpath.startY;
      for (const segment of subpath.segments) {
        switch (segment.kind) {
          case "line":
            appendPoint(points, segment.x, segment.y);
            x = segment.x;
            y = segment.y;
            break;
          case "quadratic":
            flattenQuadratic(points, x, y, segment.cpx, segment.cpy, segment.x, segment.y, 0);
            x = segment.x;
            y = segment.y;
            break;
          case "cubic":
            flattenCubic(
              points,
              x,
              y,
              segment.cp1x,
              segment.cp1y,
              segment.cp2x,
              segment.cp2y,
              segment.x,
              segment.y,
              0,
            );
            x = segment.x;
            y = segment.y;
            break;
          case "arc": {
            flattenArc(points, segment);
            const finalAngle = segment.startAngle + segment.sweep;
            x = segment.x + Math.cos(finalAngle) * segment.radius;
            y = segment.y + Math.sin(finalAngle) * segment.radius;
            break;
          }
        }
      }
      flattened.push({
        points,
        closed: subpath.closed,
        hasSegments: subpath.segments.length > 0,
      });
    }
    return flattened;
  }

  private ensureCurrent(): boolean {
    if (!this.current) {
      return false;
    }
    if (this.current.closed) {
      this.startSubpath(this.current.startX, this.current.startY);
    }
    return true;
  }

  private startSubpath(x: number, y: number): void {
    const subpath: Subpath = { startX: x, startY: y, segments: [], closed: false };
    this.subpaths.push(subpath);
    this.current = subpath;
    this.currentX = x;
    this.currentY = y;
  }
}

function flattenQuadratic(
  output: number[],
  x0: number,
  y0: number,
  cx: number,
  cy: number,
  x1: number,
  y1: number,
  depth: number,
): void {
  if (depth >= MAX_CURVE_DEPTH || pointLineDistance(cx, cy, x0, y0, x1, y1) <= FLATNESS) {
    appendPoint(output, x1, y1);
    return;
  }
  const x01 = (x0 + cx) / 2;
  const y01 = (y0 + cy) / 2;
  const x12 = (cx + x1) / 2;
  const y12 = (cy + y1) / 2;
  const x012 = (x01 + x12) / 2;
  const y012 = (y01 + y12) / 2;
  flattenQuadratic(output, x0, y0, x01, y01, x012, y012, depth + 1);
  flattenQuadratic(output, x012, y012, x12, y12, x1, y1, depth + 1);
}

function flattenCubic(
  output: number[],
  x0: number,
  y0: number,
  c1x: number,
  c1y: number,
  c2x: number,
  c2y: number,
  x1: number,
  y1: number,
  depth: number,
): void {
  const flatness = Math.max(
    pointLineDistance(c1x, c1y, x0, y0, x1, y1),
    pointLineDistance(c2x, c2y, x0, y0, x1, y1),
  );
  if (depth >= MAX_CURVE_DEPTH || flatness <= FLATNESS) {
    appendPoint(output, x1, y1);
    return;
  }

  const x01 = (x0 + c1x) / 2;
  const y01 = (y0 + c1y) / 2;
  const x12 = (c1x + c2x) / 2;
  const y12 = (c1y + c2y) / 2;
  const x23 = (c2x + x1) / 2;
  const y23 = (c2y + y1) / 2;
  const x012 = (x01 + x12) / 2;
  const y012 = (y01 + y12) / 2;
  const x123 = (x12 + x23) / 2;
  const y123 = (y12 + y23) / 2;
  const x0123 = (x012 + x123) / 2;
  const y0123 = (y012 + y123) / 2;
  flattenCubic(output, x0, y0, x01, y01, x012, y012, x0123, y0123, depth + 1);
  flattenCubic(output, x0123, y0123, x123, y123, x23, y23, x1, y1, depth + 1);
}

function flattenArc(output: number[], arc: ArcSegment): void {
  const segments = arcSegmentCount(arc.radius, arc.sweep);
  for (let i = 1; i <= segments; i += 1) {
    const angle = arc.startAngle + (arc.sweep * i) / segments;
    appendPoint(output, arc.x + Math.cos(angle) * arc.radius, arc.y + Math.sin(angle) * arc.radius);
  }
}

function pointLineDistance(
  x: number,
  y: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
): number {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared === 0) {
    return Math.hypot(x - x0, y - y0);
  }
  return Math.abs((x - x0) * dy - (y - y0) * dx) / Math.sqrt(lengthSquared);
}

function appendPoint(output: number[], x: number, y: number): void {
  const length = output.length;
  if (length >= 2 && output[length - 2] === x && output[length - 1] === y) {
    return;
  }
  output.push(x, y);
}

function finite(...values: number[]): boolean {
  return values.every(Number.isFinite);
}
