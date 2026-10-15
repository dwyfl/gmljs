# @gmljs/canvas

A portable Canvas 2D rasterizer written in strict TypeScript.

Current features include:

- a resizable `Canvas` with `getContext("2d")`
- CSS solid colors (hex, RGB, HSL, named colors, and `transparent`)
- `fillRect()` and `clearRect()`, including fractional-pixel coverage
- paths with lines, rectangles, arcs, quadratic curves, and cubic curves
- analytic anti-aliased filling with non-zero and even-odd rules
- anti-aliased strokes with butt, round, and square caps; bevel, miter, and round joins
- asynchronous PNG encoding in Node and browsers

Transforms, ImageData, and JPEG are in the roadmap. See
[ARCHITECTURE.md](./ARCHITECTURE.md) for the complete design.

## Install

```bash
npm install @gmljs/canvas
```

## Usage

```ts
import { Canvas } from "@gmljs/canvas";

const canvas = new Canvas(640, 480);
const context = canvas.getContext("2d");

context.fillStyle = "rebeccapurple";
context.fillRect(20, 20, 200, 120);

context.strokeStyle = "rgb(20 180 120 / 80%)";
context.lineWidth = 12;
context.lineCap = "round";
context.lineJoin = "round";
context.beginPath();
context.moveTo(40, 240);
context.lineTo(180, 170);
context.lineTo(300, 260);
context.stroke();

const png = await canvas.encode({ type: "png" });
```

The root export selects `node:zlib` in Node and `CompressionStream` in other runtimes.
Explicit `@gmljs/canvas/node`, `@gmljs/canvas/browser`, and `@gmljs/canvas/core` entry
points are also available. The core entry accepts a Deflate adapter and imports no platform APIs.

Pixels in `canvas.pixels` are premultiplied RGBA8. PNG output converts them to straight
alpha. Assigning either canvas dimension clears the image, resets context state, and
invalidates an earlier pixel view.

## Development

This package lives in the gmljs monorepo. Install from the repository root first
(`vp install`), then, in `packages/canvas`:

```bash
vp check
vp test
vp pack
vp run bench
```

Skia and image-diff packages are development-only dependencies used by the reference
harness. Failed reference comparisons write `ours.png`, `skia.png`, and `diff.png` under
`test-results/<scene>/`.

`@gmljs/render` uses this package as its default server render context. The GML tests and
the real-document benchmark (`vp run bench:gml`) live there, in `packages/render`, comparing
this rasterizer with node-canvas, skia-canvas, and pureimage on real GML documents. Build
this package (`vp pack`) before running them, since they import the built `@gmljs/canvas`. See [PERFORMANCE.md](./PERFORMANCE.md)
for the profile-guided optimization and measured results.
