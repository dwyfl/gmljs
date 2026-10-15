# gmljs

TypeScript libraries and tools for [GML (Graffiti Markup Language)](https://en.wikipedia.org/wiki/Graffiti_Markup_Language).

## Packages

| Package                            | Description                                                          |
| ---------------------------------- | -------------------------------------------------------------------- |
| [`@gmljs/core`](packages/core)     | Parses GML documents.                                                |
| [`@gmljs/render`](packages/render) | Renders GML documents to images and videos.                          |
| [`@gmljs/canvas`](packages/canvas) | A portable, pure-TypeScript Canvas 2D rasterizer.                    |
| [`@gmljs/cli`](packages/cli)       | The `gmljs` CLI command, which renders GML documents to image files. |

## Development

The repository uses [Vite+](https://viteplus.dev) (`vp`) and pnpm workspaces, and needs
Node.js 22.18 or later.

```bash
vp install
vp run -r build
```

Packages import each other's built `dist/`, so build before running tests or type checks
after changing a package that others depend on.

- Rebuild every package on change:

```bash
vp run dev
```

- Run the tests:

```bash
vp run -r test
```

- Format, lint, and type-check:

```bash
vp check
```

- Run everything:

```bash
vp run ready
```

Each package's README covers its own usage and development details.
