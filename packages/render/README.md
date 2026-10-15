# @gmljs/render

- It renders [GML (Graffiti Markup Language)](https://en.wikipedia.org/wiki/Graffiti_Markup_Language) documents to images and videos.
- It's a JavaScript library with full TypeScript support, for Node.js and browsers.
- It's open source.

## Installation

In Node.js, `@gmljs/render/server` renders with
[@gmljs/canvas](https://www.npmjs.com/package/@gmljs/canvas), a pure-TypeScript rasterizer that comes with the package, so
`npm install @gmljs/render` is all you need. It encodes PNG and JPEG, and images default to PNG.
Other backends are optional peer dependencies, so you only install what you use.

| Environment                                                               | Install                                 |
| ------------------------------------------------------------------------- | --------------------------------------- |
| Browser                                                                   | `npm install @gmljs/render`             |
| Browser, rendering video (`@gmljs/render/video`)                          | `npm install @gmljs/render mediabunny`  |
| Node.js with @gmljs/canvas (the default)                                  | `npm install @gmljs/render`             |
| Node.js with [node-canvas](https://github.com/Automattic/node-canvas)     | `npm install @gmljs/render canvas`      |
| Node.js with [skia-canvas](https://github.com/samizdatco/skia-canvas)     | `npm install @gmljs/render skia-canvas` |
| Node.js with [pureimage](https://github.com/joshmarinacci/node-pureimage) | `npm install @gmljs/render pureimage`   |

`canvas` downloads a native binary in an install script. With pnpm 10 or later, allow it to
run with `pnpm approve-builds`. `skia-canvas` 4 installs its binary as a platform-specific
optional dependency instead, with no install script (3.x, also supported, uses one too). `pureimage` is plain JavaScript, so it
installs anywhere, but it renders roughly 10× slower, with coarser anti-aliasing, and it
doesn't match the other backends exactly: it always draws round line caps and joins, and
overlapping translucent strokes come out darker.

## Examples

### Node.js

```typescript
import { readFileSync, writeFileSync } from "node:fs";
import { createGMLImage } from "@gmljs/render/server";

const gml = readFileSync("tag.gml", "utf8");
const image = await createGMLImage(gml, {
  // type defaults to "gmljs-canvas"; or "node-canvas", "skia-canvas", "pureimage"
  width: 1024,
  height: 768,
  background: "#eee",
  format: "png",
});

writeFileSync("tag.png", Buffer.from(image));
```

### Browser

```typescript
import { createGMLView } from "@gmljs/render/browser";

const view = createGMLView(gml, {
  type: "html-canvas",
  canvas: document.querySelector("canvas")!, // resized to width × height
  width: 800,
  height: 600,
});
view.start();
```

Leave out `canvas` to draw into a new one, or use `type: "offscreen-canvas"`.

### Video (browser)

```typescript
import { renderToVideo } from "@gmljs/render/video";

const mp4 = await renderToVideo(gml, {
  width: 1280,
  height: 720,
  format: "mp4",
});
```

## Invalid documents

GML is parsed leniently: invalid points and values are skipped, and the problems are listed
as warnings. Malformed XML is rejected with a `GMLParseError`.

```typescript
import { GMLParseError } from "@gmljs/render";
import { createGMLImage, createGMLView } from "@gmljs/render/server";

try {
  await createGMLImage(gml, { type: "node-canvas", width: 1024, height: 768 });
} catch (error) {
  if (error instanceof GMLParseError) console.error("Not valid XML:", error.message);
}

const view = createGMLView(gml, {
  type: "node-canvas",
  width: 1024,
  height: 768,
});
for (const warning of view.gml.warnings) console.warn(warning.message);
```

Rendering documents from untrusted sources, such as uploads on a server? See
[SECURITY.md](https://github.com/dwyfl/gmljs/blob/main/SECURITY.md) for the limits to set.

## Made with @gmljs/render

![KATSU tag rendered with @gmljs/render](https://raw.githubusercontent.com/dwyfl/gmljs/main/packages/render/docs/katsu.webp)
