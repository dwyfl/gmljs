/**
 * Thrown when a GML (or XML) document can't be parsed.
 *
 * `path` points at the offending element, e.g.
 * `["gml[0]", "tag[0]", "drawing[0]", "stroke[0]", "pt[3]", "x[0]"]`.
 */
export class GMLParseError extends Error {
  /** The error message without the location suffix. */
  readonly reason: string;
  readonly path: readonly string[];

  constructor(reason: string, options: { path?: readonly string[]; cause?: unknown } = {}) {
    const { path = [], cause } = options;
    super(
      path.length ? `${reason} (at ${path.join("/")})` : reason,
      cause === undefined ? undefined : { cause },
    );
    this.name = "GMLParseError";
    this.reason = reason;
    this.path = path;
  }

  /** Returns a copy of this error with `segment` prepended to its path. */
  withParent(segment: string): GMLParseError {
    return new GMLParseError(this.reason, { path: [segment, ...this.path], cause: this.cause });
  }
}
