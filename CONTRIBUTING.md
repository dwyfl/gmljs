# Contributing

Thanks for helping out! Bug reports, GML files that render wrong, and pull requests are all
welcome.

## Setup

You need Node.js 22.18 or later and [Vite+](https://viteplus.dev/guide/) (`vp`), which also
installs the right pnpm version.

```bash
vp install
vp run ready   # check (format, lint, types), build, and test everything
```

The packages depend on each other's built output, so run `vp run -r build` after changing
`@gmljs/core` or `@gmljs/canvas`, before testing `@gmljs/render`, `@gmljs/player` or `@gmljs/cli`.

To work on the player interactively, run `vp run --filter @gmljs/player dev:interactive`. It rebuilds
the player on every change and serves a demo page with sample documents, which reloads after
each rebuild.

The render and canvas tests compare against [skia-canvas](https://github.com/samizdatco/skia-canvas)
and [node-canvas](https://github.com/Automattic/node-canvas), which install native binaries.
If either fails to install on your platform, open an issue.

## Packages

| Package           | What it is                                                         |
| ----------------- | ------------------------------------------------------------------ |
| `packages/core`   | Parses GML (XML) into a document tree. Node and browser builds.    |
| `packages/canvas` | A pure-TypeScript Canvas 2D rasterizer. See its `ARCHITECTURE.md`. |
| `packages/render` | Renders GML to images and video, with several canvas backends.     |
| `packages/player` | The `GMLPlayer` React component.                                   |
| `packages/cli`    | The `gmljs` command.                                               |

## Pull requests

- Add or update tests for the behavior you change.
- If the change affects a published package, run `vp run changeset` and describe it for
  the changelog. Pick `patch` for fixes, `minor` for new features, and `major` for breaking
  changes.
- A pre-commit hook formats and lints staged files (`vp staged`).

## Releasing

Maintainers release with [Changesets](https://changesets.dev). The packages are in beta
prerelease mode (`.changeset/pre.json`), so versions are `1.0.0-beta.N`, published under
the `beta` dist-tag.

```bash
vp run changeset version     # apply pending changesets: bump versions, write changelogs
git commit -am "chore: release"
vp run ready                 # build, check, test
pnpm exec changeset publish  # publish what isn't on npm yet
git push --follow-tags
```

Run `changeset publish` directly rather than through `vp run`: it needs an interactive
terminal to ask for the npm one-time password.
