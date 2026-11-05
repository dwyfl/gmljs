# @gmljs/player

- It plays [GML (Graffiti Markup Language)](https://en.wikipedia.org/wiki/Graffiti_Markup_Language) documents in the browser.
- It's a React component with playback controls, built on [`@gmljs/render`](../render).
- It's open source.

## Installation

```
npm install @gmljs/player react
```

## Usage

```tsx
import { GMLPlayer } from "@gmljs/player";
import "@gmljs/player/style.css";

export function Viewer({ gml }: { gml: string }) {
  return (
    <div style={{ height: 480 }}>
      <GMLPlayer gml={gml} />
    </div>
  );
}
```

The player fills its container, so give the container a size. The package is marked `"use client"`, so it can be imported directly from React Server Components frameworks such as Next.js.

### Props

| Prop            | Type                           | Default   | Description                                                                         |
| --------------- | ------------------------------ | --------- | ----------------------------------------------------------------------------------- |
| `gml`           | `string \| GML`                |           | The document, as XML or parsed. Changing it replaces the drawing.                   |
| `autoPlay`      | `boolean`                      | `false`   | Start playing when mounted.                                                         |
| `defaultLoop`   | `boolean`                      | `true`    | Initial loop setting. The loop button and <kbd>R</kbd> toggle it.                   |
| `speed`         | `number`                       | `1`       | Playback speed.                                                                     |
| `renderOptions` | `Partial<RenderOptions>`       |           | Appearance: `color`, `background`, `brushSizeMultiplier`, `drips`, etc. Memoize it. |
| `controls`      | `boolean`                      | `true`    | Show the control bar.                                                               |
| `preview`       | `boolean`                      | `true`    | Show a thumbnail of the hovered position above the seekbar.                         |
| `keyboard`      | `"focus" \| "global" \| false` | `"focus"` | Where shortcuts apply: while the player has focus, anywhere, or nowhere.            |
| `onEscape`      | `() => void`                   |           | Called when <kbd>Escape</kbd> is pressed outside fullscreen.                        |
| `className`     | `string`                       |           |                                                                                     |
| `style`         | `CSSProperties`                |           |                                                                                     |

### Keyboard shortcuts

| Key                         | Action                                                                       |
| --------------------------- | ---------------------------------------------------------------------------- |
| <kbd>Space</kbd>            | Play / pause                                                                 |
| <kbd>←</kbd> / <kbd>→</kbd> | Step 0.1 s while paused (×10 with <kbd>Shift</kbd>, ×10 with <kbd>Alt</kbd>) |
| <kbd>R</kbd>                | Toggle loop                                                                  |
| <kbd>Escape</kbd>           | Calls `onEscape`                                                             |

## Styling

All elements have `gmlp-*` class names, and the colors and sizes are CSS custom properties on `.gmlp-root`:

```css
.my-player {
  --gmlp-bg: #18181b;
  --gmlp-fg: #a1a1aa;
  --gmlp-track-fill: #ef4444;
  --gmlp-controls-height: 48px;
}
```

See [`src/style.css`](src/style.css) for the full list.

## Custom layouts

`GMLPlayer` is composed from parts that are exported too. Playback logic lives in `PlayerController`, which has no React dependency. Components read it from `PlayerContext`.

```tsx
import { useRef } from "react";
import {
  PlayerCanvas,
  PlayerContext,
  PlayOverlay,
  Seekbar,
  useGMLPlayer,
  usePlayerController,
  usePlayerState,
} from "@gmljs/player";

function PlayButton() {
  const controller = usePlayerController();
  const isPlaying = usePlayerState((state) => state.isPlaying);
  return <button onClick={() => controller.togglePlay()}>{isPlaying ? "Pause" : "Play"}</button>;
}

export function MinimalPlayer({ gml }: { gml: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controller = useGMLPlayer(canvasRef, { gml });
  return (
    <PlayerContext.Provider value={controller}>
      <div className="gmlp-root">
        <PlayerCanvas canvasRef={canvasRef}>
          <PlayOverlay />
        </PlayerCanvas>
        <PlayButton />
        <Seekbar preview={false} />
      </div>
    </PlayerContext.Provider>
  );
}
```

`usePlayerState(selector)` only re-renders when the selected value changes, so components that don't show the time don't re-render on every frame.

## Development

```
vp run --filter @gmljs/player dev:interactive
```

This rebuilds the library on every change and serves a demo page (`playground/`) that loads the built output, with sample documents, drag-and-drop for your own `.xml` files and toggles for the props. Add `?autoplay` to the URL to start playing on load.
