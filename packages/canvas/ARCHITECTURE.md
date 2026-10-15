# Architecture

This document fixes the v1 boundaries and the implementation direction. It was written
before the code and still describes features planned for later milestones: transforms,
`save()`/`restore()`, `globalAlpha`, `ImageData`, and JPEG. The
[README](./README.md#compatibility) lists what is implemented today.

The first optimization target is `@gmljs/render`: long, self-crossing polylines with
round caps and joins, plus a four-edge background polygon. Correctness against Skia is
the gate; performance work follows measurement.

The package is published as `@gmljs/canvas`. The public classes use the neutral names
`Canvas` and `CanvasContext2D`, so the package name does not leak into
application code. The context is deliberately not called `CanvasRenderingContext2D`: it
implements a subset of that API, and the name would also clash with the DOM's global type.

## Layers and portability

The dependency direction is one-way:

```text
Canvas API and state
  -> paths / curve flattening / stroking
    -> analytic scanline rasterizer
      -> premultiplied pixel buffer and span compositor

PNG/JPEG facade
  -> format writer
    -> injected platform codec (Deflate for PNG)
```

Planned source boundaries are `canvas/`, `path/`, `raster/`, `pixels/`, `color/`, and
`encode/`. The drawing core imports no Node, DOM, or encoder APIs. `node.ts` supplies a
`node:zlib` Deflate adapter; `browser.ts` supplies a `CompressionStream("deflate")`
adapter. Conditional package exports make Node use the former and other modern runtimes
use the latter, while `./core` exposes explicit codec injection. This also makes the
core independently testable and tree-shakeable.

The implementation is strict ESM TypeScript and emits declarations with Vite+/tsdown.
No runtime dependency is needed through PNG support.

## Public API

The primary API mirrors the supported Canvas 2D surface:

```ts
const canvas = new Canvas(width, height);
const context = canvas.getContext("2d"); // same object on every call

context.beginPath();
context.moveTo(10, 10);
context.lineTo(100, 100);
context.stroke();

const bytes = await canvas.encode({ format: "png" });
```

`Canvas` has settable `width` and `height`. Resizing reallocates a transparent-black
buffer, resets context state, and invalidates previously returned direct pixel views,
matching the useful browser behavior. Dimensions must be finite, non-negative safe
integers whose byte size can be represented safely; invalid or unallocatable dimensions
throw rather than relying on platform-specific typed-array errors.

`CanvasContext2D` exposes only the v1 methods and properties in the project
brief. Its declarations are structurally compatible with the corresponding DOM members
where practical, without requiring the DOM type library. `Matrix2D` and `ImageData` are
small portable value types shaped like the relevant browser objects.

Encoding is deliberately asynchronous and explicit:

- `encode({ format, quality?, chromaSubsampling? }): Promise<Uint8Array>` is the canonical
  method. `format` is validated at runtime, and unknown values throw.
- `toBlob(...)` and `toDataURL(...)` are async conveniences for the `@gmljs/render` adapter.
- Unsupported encoders fail with a descriptive error; drawing never depends on them.

The `@gmljs/render` adapter should only forward dimensions and drawing properties, implement
`clear()` with `clearRect` plus optional `fillRect`, and wrap these encoding methods.

## Pixel storage and compositing

Each canvas owns one `Uint8Array` in row-major RGBA byte order. RGB is premultiplied by
alpha; transparent black is therefore `[0, 0, 0, 0]`. A `Uint32Array` view is used only
for aligned fills after packing a word for the runtime's endianness. Byte order never
depends on endianness.

Colors remain in sRGB component space. Source-over compositing uses premultiplied integer
math without linear-light conversion, in line with Canvas behavior. A paint operation
combines parsed style alpha, `globalAlpha`, and analytic coverage once, then composites
an entire span. Rounding is centralized and tested against Chrome and Skia rather than
being repeated in callers.

The compositor has four paths:

1. Opaque, fully covered spans use `Uint32Array.fill`.
2. Long translucent spans over a uniform destination calculate one packed result and use
   `Uint32Array.fill`.
3. Other long translucent spans use a lazily allocated 16-bit-pair scaling table. The
   128 KiB table is built only after a nonuniform span of at least 4,096 pixels reaches
   this path and is reused while the inverse alpha is unchanged.
4. Short and boundary spans scale two byte lanes at a time with exact packed integer
   arithmetic and allocate nothing.

Identity-transform, integer-aligned `clearRect` writes zeros directly. A full-canvas
clear uses `Uint32Array.fill(0)`. A whole-width integer `fillRect` is one contiguous span;
identity-transform opaque fills use the word-fill path, while transformed rectangles and
fractional edges use the rasterizer.
`clearRect` ignores paint state and uses coverage to erase partially covered boundary
pixels.

The direct pixel view is exposed explicitly as **premultiplied RGBA8** and is invalidated
by resize. In contrast, `getImageData` copies and unpremultiplies into a
`Uint8ClampedArray`; `putImageData` copies and premultiplies while ignoring transforms and
paint state. For alpha zero, returned RGB is zero. Conversion uses nearest-integer
rounding, so a straight -> premultiplied -> straight round trip is necessarily lossy at
low alpha. PNG receives the same straight-alpha conversion because PNG stores
unassociated alpha.

## Paths, transforms, and curves

The current path is not part of saved drawing state. Each segment retains its geometry
and the transform in effect when it was appended. This is necessary because the Canvas
standard applies the current transform while building the default path, but applies the
painting transform to stroke style as well.

For fill, segments are evaluated directly in device space. For stroke, device-space path
geometry is mapped through the inverse of the transform active at `stroke()`, expanded by
`lineWidth` in that stroke space, then mapped forward again. Thus a non-uniform scale
turns round caps into the correct device-space ellipses and scales width and joins in the
same way as Canvas. Singular transforms and transform changes between path construction
and painting get focused Chrome/Skia compatibility tests before their behavior is fixed.

Lines, quadratics, cubics, and arcs remain semantic segments until painting. Curves are
recursively subdivided using a device-space flatness test, initially at a maximum error
of 1/8 pixel with a recursion cap. The tolerance is a quality constant, not tied to path
length. Arc sweep normalization follows Canvas, and a full circle remains distinguishable
from an empty arc. Non-finite arguments follow browser no-op behavior and are covered by
unit tests.

`fill()` implicitly closes open subpaths without mutating them. `closePath()` records a
closed flag rather than appending a duplicate point. Repeated points remain observable
until stroking, where they are normalized with their cap semantics preserved.

## Analytic scanline rasterizer

The rasterizer follows the signed cover/area family used by Anti-Grain Geometry and the
v2 `stb_truetype` rasterizer, rather than supersampling. Coordinates are quantized to a
24.8 grid and edge traversal is clipped vertically and horizontally to the canvas.

For each non-horizontal edge, traversal accumulates two signed values in every crossed
cell:

- **cover**, the edge's signed vertical contribution;
- **area**, the signed trapezoid area inside that cell.

At the end of a scanline, a running cover plus each cell's area yields the pixel's
analytic box coverage. Non-zero fill takes the magnitude and clamps it to one; even-odd
fill folds the magnitude across alternating unit intervals. Both rules therefore share
all edge walking and differ only in coverage normalization. Horizontal and vertical
edges, coordinates on pixel boundaries, winding reversal, and off-canvas contours receive
dedicated tests.

The workspace is indexed relative to the path's clipped integer bounds. It contains a
reusable `Float64Array` of deltas, a byte flag per cell, and a `Uint32Array` of unique
touched-cell indices; all three grow geometrically and are never shrunk. Edges carry
winding rightward from their own cells, so a closed contour has zero winding before and
after each row's touched range. The touched indices are sorted once, then the compositor
walks only those edge events and emits the constant-coverage spans between them. It zeros
each delta and its flag as it reads them, avoiding a separate workspace clear. Paints
with no non-horizontal edges return before allocating or touching the workspace.
Consequently, raster work follows path bounds and edge-event count rather than canvas
area or the width of every covered scanline.

The 24.8 grid makes coverage exact for quantized edges, with at most 1/256-pixel input
quantization. If Skia diffs show this precision is insufficient, the precision constant
can move to 10 or 12 fractional bits without changing the algorithm.

References:

- [Anti-Grain Geometry cell accumulator](https://franko.github.io/antigrain/__code/include/agg_rasterizer_cells_aa.h.html)
- [`stb_truetype` v2 rasterizer](https://github.com/nothings/stb/blob/master/stb_truetype.h)

## Stroking

Stroking traces the boundary of the swept path and sends it through one non-zero fill. An
open subpath becomes one closed contour: its left offset runs forward, its right offset
runs backward, and the two are joined by the end caps. A closed subpath becomes an outer
boundary plus an oppositely wound inner boundary. The old representation—one rectangle
per segment plus overlapping join and cap pieces—was removed because adding their partial
pixel coverage was not the same as rasterizing their geometric union.

This boundary representation means each exterior edge is accumulated once. It also keeps
the existing guarantee that self-crossing or translucent strokes are composited exactly
once: the complete outline is still resolved by one non-zero fill before source-over
compositing.

For each normalized subpath:

- Butt and square caps connect the two offset sides directly; square caps extend both
  sides by half the line width. Round caps add only the required semicircle.
- On the outside of a turn, bevel joins connect the two offsets, miter joins use their
  line intersection when it is within `miterLimit`, and round joins add only the exterior
  arc. Arc tessellation remains adaptive to the 1/8-pixel flatness constant. Rather than
  leaving each polygon inscribed, its vertex radius is scaled by
  `sqrt(step / sin(step))`, which preserves the area of an equal-step circle without
  adding vertices. Partial arcs keep their exact endpoints where they meet straight
  offsets, so their first and last segments remain slightly conservative.
- On the inside of a turn, offset lines meet at their intersection only when that point
  lies within both adjacent finite segment extents. Near reversals connect the two offset
  endpoints instead, preventing an inner intersection from projecting far beyond a short
  segment and cutting a hole through the stroke.
- Closed paths join last to first, have no caps, and orient their larger boundary
  positively and their smaller boundary negatively.
- Repeated interior points are removed. A subpath containing a zero-length segment paints
  nothing for butt caps, a disk for round caps, and a centered square for square caps;
  a move-only subpath remains empty, matching Skia.
- Exact and near-180-degree turns use explicit branches so ray intersection cannot
  explode numerically. Very thin lines retain analytic fractional coverage; very wide
  lines are clipped before rasterization.

This is the Canvas model: trace the swept path, take overlapping portions as a union, and
fill the result with the non-zero rule. See the [Canvas stroke
steps](https://html.spec.whatwg.org/multipage/canvas.html#dom-context-2d-stroke) and [line
style tracing algorithm](https://html.spec.whatwg.org/multipage/canvas.html#line-styles).

## Styles and state

The color parser is a small, DOM-free parser for exactly the promised subset: 3/4/6/8
digit hex; legacy comma and modern space/slash `rgb()`/`rgba()` and `hsl()`/`hsla()`;
the CSS named-color table; and `transparent`. Keywords are ASCII case-insensitive,
channels and alpha are clamped as CSS requires, hue wraps, and invalid assignments leave
the previous style unchanged. The grammar and conversion tests are derived from [CSS
Color 4](https://www.w3.org/TR/css-color/).

The save stack contains fill/stroke colors, line properties, `globalAlpha`, and the
current transform. `save()` copies this small state record; `restore()` on an empty stack
does nothing. Neither paths nor pixels are saved. Defaults and invalid-property behavior
match Canvas.

## Encoding

The PNG writer emits signature, IHDR (8-bit RGBA, non-interlaced), IDAT, and IEND with
checked lengths and CRC-32. It copies one row at a time, converts only partially
transparent pixels to straight alpha, and chooses among None/Sub/Up/Average/Paeth using
the sum-of-absolute-filtered-bytes heuristic. Filter scoring samples every second pixel
while retaining all four channels; this bounds the JavaScript cost without changing
decoded pixels. The selected filter is applied to the complete row before passing the
stream to the injected zlib-format Deflater. PNG requires unassociated alpha and permits
per-row filter selection; see the [PNG Third Edition
specification](https://www.w3.org/TR/png-3/). Browser `CompressionStream("deflate")`
produces the required zlib-wrapped stream, as specified by the [Compression Streams
standard](https://compression.spec.whatwg.org/).

The JPEG writer is an in-house, pure-TypeScript baseline sequential JFIF encoder. It uses
the standard Annex K quantization and Huffman tables, an AAN floating-point DCT, and either
4:2:0 (the default) or 4:4:4 chroma sampling. Quality uses the HTML Canvas 0–1 contract at
the API boundary and IJG's 1–100 table scaling internally. Because pixels are premultiplied,
encoding RGB directly produces the required result composited over opaque black.

Encoding works one MCU at a time. Before color conversion, the encoder compares real source
pixels through an aligned 32-bit view; a uniform MCU converts one pixel and emits only DC
plus EOB for all of its blocks. Other 4:2:0 MCUs convert 2×2 quads directly into four Y
samples and one averaged chroma sample, avoiding full-resolution chroma planes and a second
downsampling pass. The 4:4:4 path retains one sample of every component per source pixel.

Small typed MCU, block, coefficient, and offset scratch buffers are shared across calls;
the synchronous encoder invokes no user code and therefore cannot observe reentrancy. The
entropy writer owns its typed output buffer and bit accumulator, reserves a worst-case
amount once per MCU, and performs byte stuffing inline. Normal outputs return a zero-copy
subarray; unusually compressible outputs get an exact copy rather than retaining a much
larger estimated buffer. JPEG needs no injected platform codec, while the public Canvas
facade remains asynchronous.

## Verification and performance discipline

Unit tests cover color grammar, premultiplication rounding, blend vectors, matrices,
path state, curve tolerance, fill-rule winding, and stroker degeneracies. Small coverage
tests assert exact alpha grids; browser-disagreement cases have explicit Chrome and Skia
fixtures.

The reference harness renders each deterministic gallery scene through this library and
`skia-canvas`, decodes both, and runs `pixelmatch` at threshold 0.1. A scene defines its
background/ink predicate so mismatch is divided by reference ink rather than all pixels.
On failure it writes `ours.png`, `skia.png`, and an amplified `diff.png` under
`test-results/<scene>/`; passing tests leave no artifacts. `skia-canvas`, `pixelmatch`,
and the test PNG decoder are development-only dependencies.

JPEG conformance tests parse marker structure and tables, exercise odd and high-entropy
dimensions in both sampling modes, and decode every case with both `jpeg-js` and
Skia/libjpeg-turbo. Fidelity and size are also compared with jpeg-js's baseline encoder.

The stricter GML harness also reports ink-mass bias, mean/maximum luminance error, the
share of touched pixels above an error of 16, signed over/under coverage, decoded-pixel
hashes, and distance from a 16× Skia render with exact box downsampling. Its report mode
writes signed heatmaps and crops centered on the worst-error pixel. Expected-failure tests
keep the new accuracy targets visible until the renderer satisfies them.

The GML harness and the performance harness live in `packages/render` (`tests/gmljs-canvas.test.ts`
and `scripts/gml-bench.ts`) and render the real GML documents in its `tests/data/`. Each
operation is warmed up, sampled independently, and reported as the median with
runtime/version, dimensions, and run count. Optimization starts from a CPU profile.
Claims are made only from the table comparing this library, node-canvas, skia-canvas, and
pureimage on the same machine; fast paths remain covered by pixel-equivalence tests. The
first profile-guided pass fused PNG filter scoring into one row traversal and specialized
the winning-filter write loop. The second uses native row copies and bounded filter
sampling while continuing to consider all five standard filters. Measurements and the
compressed-size tradeoff are recorded in `PERFORMANCE.md`.

## Provenance

All code in this package was written for it, with AI coding assistants, from the
published descriptions of the algorithms referenced in this document (Anti-Grain
Geometry's and `stb_truetype`'s cell accumulators, PNG, and baseline JPEG). No source code
was copied or translated from those projects, so they need no third-party notices. The
JPEG quantization tables are the example tables from the JPEG standard (ITU-T T.81,
Annex K).

## Decisions requiring review

1. Resolved: use the in-house encoder. jpeg-js remains development-only as an independent
   decoder and 4:4:4 baseline; its lack of chroma subsampling made it unsuitable at runtime.
2. The initial curve tolerance is 1/8 pixel and subpixel grid is 24.8; Skia diff results
   may justify tightening either constant without changing public behavior.

Primary behavior reference: [WHATWG Canvas
2D](https://html.spec.whatwg.org/multipage/canvas.html#the-canvas-element). When it and
shipping browsers diverge, a Chrome/Skia compatibility test documents the chosen result.
