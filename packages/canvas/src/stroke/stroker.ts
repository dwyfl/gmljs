import type { FlattenedSubpath } from "../path/path.ts";

export type LineCap = "butt" | "round" | "square";
export type LineJoin = "bevel" | "miter" | "round";

export interface StrokeStyle {
  readonly lineWidth: number;
  readonly lineCap: LineCap;
  readonly lineJoin: LineJoin;
  readonly miterLimit: number;
}

interface Point {
  readonly x: number;
  readonly y: number;
}

interface Segment {
  readonly start: Point;
  readonly end: Point;
  readonly length: number;
  readonly ux: number;
  readonly uy: number;
  readonly nx: number;
  readonly ny: number;
}

const FLATNESS = 0.125;
const MINIMUM_CIRCLE_SEGMENTS = 16;
const EPSILON = 1e-12;

export class Stroker {
  stroke(subpaths: readonly FlattenedSubpath[], style: StrokeStyle): FlattenedSubpath[] {
    const contours: FlattenedSubpath[] = [];
    const radius = style.lineWidth / 2;

    for (const subpath of subpaths) {
      const points = normalizePoints(subpath.points, subpath.closed);
      if (points.length === 0) {
        continue;
      }
      if (points.length === 1) {
        if (!subpath.closed && subpath.hasSegments) {
          this.addZeroLengthCap(contours, points[0]!, radius, style.lineCap);
        }
        continue;
      }

      const segments = makeSegments(points, subpath.closed, radius);
      if (segments.length === 0) {
        continue;
      }

      if (subpath.closed) {
        addClosedOutline(contours, segments, radius, style);
      } else {
        addOpenOutline(contours, segments, radius, style);
      }
    }

    return contours;
  }

  private addZeroLengthCap(
    contours: FlattenedSubpath[],
    point: Point,
    radius: number,
    lineCap: LineCap,
  ): void {
    if (lineCap === "round") {
      addCircle(contours, point, radius);
    } else if (lineCap === "square") {
      addContour(contours, [
        point.x - radius,
        point.y - radius,
        point.x + radius,
        point.y - radius,
        point.x + radius,
        point.y + radius,
        point.x - radius,
        point.y + radius,
      ]);
    }
  }
}

function normalizePoints(values: readonly number[], closed: boolean): Point[] {
  const points: Point[] = [];
  for (let index = 0; index < values.length; index += 2) {
    const point = { x: values[index]!, y: values[index + 1]! };
    const previous = points[points.length - 1];
    if (!previous || Math.hypot(point.x - previous.x, point.y - previous.y) > EPSILON) {
      points.push(point);
    }
  }
  if (closed && points.length > 1) {
    const first = points[0]!;
    const last = points[points.length - 1]!;
    if (Math.hypot(first.x - last.x, first.y - last.y) <= EPSILON) {
      points.pop();
    }
  }
  return points;
}

function makeSegments(points: readonly Point[], closed: boolean, radius: number): Segment[] {
  const segments: Segment[] = [];
  const count = closed ? points.length : points.length - 1;
  for (let index = 0; index < count; index += 1) {
    const start = points[index]!;
    const end = points[(index + 1) % points.length]!;
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.hypot(dx, dy);
    if (length <= EPSILON) {
      continue;
    }
    const ux = dx / length;
    const uy = dy / length;
    segments.push({ start, end, length, ux, uy, nx: -uy * radius, ny: ux * radius });
  }
  return segments;
}

function addOpenOutline(
  contours: FlattenedSubpath[],
  segments: readonly Segment[],
  radius: number,
  style: StrokeStyle,
): void {
  const left = buildSide(segments, 1, false, radius, style);
  const right = buildSide(segments, -1, false, radius, style);
  const outline = [...left];
  const finalSegment = segments[segments.length - 1]!;
  const endRight = pointAt(right, right.length / 2 - 1);
  if (style.lineCap === "round") {
    appendArc(
      outline,
      finalSegment.end,
      pointAt(left, left.length / 2 - 1),
      endRight,
      -Math.PI,
      true,
      radius,
    );
  } else {
    appendPoint(outline, endRight.x, endRight.y);
  }

  for (let index = right.length - 4; index >= 0; index -= 2) {
    appendPoint(outline, right[index]!, right[index + 1]!);
  }

  if (style.lineCap === "round") {
    appendArc(
      outline,
      segments[0]!.start,
      pointAt(right, 0),
      pointAt(left, 0),
      -Math.PI,
      false,
      radius,
    );
  }
  addContour(contours, outline);
}

function addClosedOutline(
  contours: FlattenedSubpath[],
  segments: readonly Segment[],
  radius: number,
  style: StrokeStyle,
): void {
  const left = buildSide(segments, 1, true, radius, style);
  const right = buildSide(segments, -1, true, radius, style);
  const leftArea = Math.abs(signedArea(left));
  const rightArea = Math.abs(signedArea(right));
  const outer = leftArea >= rightArea ? left : right;
  const inner = outer === left ? right : left;
  addContour(contours, outer);
  addContour(contours, inner, false);
}

function buildSide(
  segments: readonly Segment[],
  side: -1 | 1,
  closed: boolean,
  radius: number,
  style: StrokeStyle,
): number[] {
  const points: number[] = [];
  if (closed) {
    for (let index = 0; index < segments.length; index += 1) {
      appendJoin(
        points,
        segments[(index + segments.length - 1) % segments.length]!,
        segments[index]!,
        side,
        radius,
        style,
      );
    }
    return points;
  }

  const first = segments[0]!;
  const square = style.lineCap === "square" ? radius : 0;
  appendPoint(
    points,
    first.start.x + first.nx * side - first.ux * square,
    first.start.y + first.ny * side - first.uy * square,
  );
  for (let index = 1; index < segments.length; index += 1) {
    appendJoin(points, segments[index - 1]!, segments[index]!, side, radius, style);
  }
  const last = segments[segments.length - 1]!;
  appendPoint(
    points,
    last.end.x + last.nx * side + last.ux * square,
    last.end.y + last.ny * side + last.uy * square,
  );
  return points;
}

function appendJoin(
  output: number[],
  previous: Segment,
  next: Segment,
  side: -1 | 1,
  radius: number,
  style: StrokeStyle,
): void {
  const point = next.start;
  const previousOffset = {
    x: point.x + previous.nx * side,
    y: point.y + previous.ny * side,
  };
  const nextOffset = { x: point.x + next.nx * side, y: point.y + next.ny * side };
  const cross = previous.ux * next.uy - previous.uy * next.ux;
  const dot = previous.ux * next.ux + previous.uy * next.uy;

  if (Math.abs(cross) <= EPSILON) {
    if (dot >= 0) {
      appendPoint(output, nextOffset.x, nextOffset.y);
    } else if (style.lineJoin === "round") {
      appendPoint(output, previousOffset.x, previousOffset.y);
      appendArc(
        output,
        point,
        previousOffset,
        nextOffset,
        side === 1 ? -Math.PI : Math.PI,
        true,
        radius,
      );
    } else {
      appendPoint(output, previousOffset.x, previousOffset.y);
      appendPoint(output, nextOffset.x, nextOffset.y);
    }
    return;
  }

  const intersection = lineIntersection(previousOffset, previous, nextOffset, next);
  const outer = side * cross < 0;
  if (!outer) {
    if (
      intersection &&
      innerIntersectionIsOnSegments(intersection, previousOffset, nextOffset, previous, next)
    ) {
      appendPoint(output, intersection.x, intersection.y);
    } else {
      appendPoint(output, previousOffset.x, previousOffset.y);
      appendPoint(output, nextOffset.x, nextOffset.y);
    }
    return;
  }

  appendPoint(output, previousOffset.x, previousOffset.y);
  if (style.lineJoin === "round") {
    appendArc(output, point, previousOffset, nextOffset, Math.atan2(cross, dot), true, radius);
    return;
  }
  if (
    style.lineJoin === "miter" &&
    intersection &&
    Math.hypot(intersection.x - point.x, intersection.y - point.y) <= style.miterLimit * radius
  ) {
    appendPoint(output, intersection.x, intersection.y);
  }
  appendPoint(output, nextOffset.x, nextOffset.y);
}

function innerIntersectionIsOnSegments(
  intersection: Point,
  previousOffset: Point,
  nextOffset: Point,
  previous: Segment,
  next: Segment,
): boolean {
  const alongPrevious =
    (intersection.x - previousOffset.x) * previous.ux +
    (intersection.y - previousOffset.y) * previous.uy;
  const alongNext =
    (intersection.x - nextOffset.x) * next.ux + (intersection.y - nextOffset.y) * next.uy;
  return (
    alongPrevious >= -previous.length - EPSILON &&
    alongPrevious <= EPSILON &&
    alongNext >= -EPSILON &&
    alongNext <= next.length + EPSILON
  );
}

function addCircle(contours: FlattenedSubpath[], center: Point, radius: number): void {
  const points: number[] = [];
  const segments = arcSegments(radius, Math.PI * 2);
  const vertexRadius = areaMatchedRadius(radius, (Math.PI * 2) / segments);
  for (let index = 0; index < segments; index += 1) {
    const angle = (index * Math.PI * 2) / segments;
    points.push(
      center.x + Math.cos(angle) * vertexRadius,
      center.y + Math.sin(angle) * vertexRadius,
    );
  }
  addContour(contours, points);
}

function lineIntersection(a: Point, first: Segment, b: Point, second: Segment): Point | undefined {
  const denominator = first.ux * second.uy - first.uy * second.ux;
  if (Math.abs(denominator) <= EPSILON) {
    return undefined;
  }
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const distance = (dx * second.uy - dy * second.ux) / denominator;
  return { x: a.x + first.ux * distance, y: a.y + first.uy * distance };
}

function appendArc(
  output: number[],
  center: Point,
  start: Point,
  end: Point,
  sweep: number,
  includeEnd: boolean,
  radius: number,
): void {
  const segments = arcSegments(radius, Math.abs(sweep));
  const startAngle = Math.atan2(start.y - center.y, start.x - center.x);
  const vertexRadius = areaMatchedRadius(radius, Math.abs(sweep) / segments);
  const finalIndex = includeEnd ? segments : segments - 1;
  for (let index = 1; index <= finalIndex; index += 1) {
    if (includeEnd && index === segments) {
      appendPoint(output, end.x, end.y);
    } else {
      const angle = startAngle + (sweep * index) / segments;
      appendPoint(
        output,
        center.x + Math.cos(angle) * vertexRadius,
        center.y + Math.sin(angle) * vertexRadius,
      );
    }
  }
}

function areaMatchedRadius(radius: number, angleStep: number): number {
  // A regular polygon on the true radius is always too small. Scale its vertices so
  // n * r² * sin(step) / 2 equals the circle's exact area instead. Partial arcs retain
  // their exact endpoints, making their first and last segments slightly conservative.
  return radius * Math.sqrt(angleStep / Math.sin(angleStep));
}

function arcSegments(radius: number, sweep: number): number {
  const maximumAngle =
    radius <= FLATNESS ? Math.PI / 2 : Math.min(Math.PI / 2, 2 * Math.acos(1 - FLATNESS / radius));
  return Math.max(
    1,
    Math.ceil((MINIMUM_CIRCLE_SEGMENTS * sweep) / (Math.PI * 2)),
    Math.ceil(sweep / maximumAngle),
  );
}

function pointAt(points: readonly number[], index: number): Point {
  return { x: points[index * 2]!, y: points[index * 2 + 1]! };
}

function appendPoint(points: number[], x: number, y: number): void {
  const length = points.length;
  if (
    length < 2 ||
    Math.abs(points[length - 2]! - x) > EPSILON ||
    Math.abs(points[length - 1]! - y) > EPSILON
  ) {
    points.push(x, y);
  }
}

function addContour(contours: FlattenedSubpath[], points: number[], positiveWinding = true): void {
  if (signedArea(points) >= 0 !== positiveWinding) {
    reversePoints(points);
  }
  contours.push({ points, closed: true, hasSegments: true });
}
function signedArea(points: readonly number[]): number {
  let area = 0;
  for (let index = 0; index < points.length; index += 2) {
    const next = (index + 2) % points.length;
    area += points[index]! * points[next + 1]! - points[next]! * points[index + 1]!;
  }
  return area / 2;
}

function reversePoints(points: number[]): void {
  for (let left = 0, right = points.length - 2; left < right; left += 2, right -= 2) {
    const x = points[left]!;
    const y = points[left + 1]!;
    points[left] = points[right]!;
    points[left + 1] = points[right + 1]!;
    points[right] = x;
    points[right + 1] = y;
  }
}
