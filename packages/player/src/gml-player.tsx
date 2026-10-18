import { useRef, type CSSProperties } from "react";
import type { GML, RenderOptions } from "@gmljs/render";
import { PlayerContext } from "./context.ts";
import { classNames } from "./class-names.ts";
import { useGMLPlayer } from "./hooks/use-gml-player.ts";
import { useFullscreen } from "./hooks/use-fullscreen.ts";
import { useKeyboardShortcuts, type KeyboardMode } from "./hooks/use-keyboard-shortcuts.ts";
import { PlayerCanvas } from "./components/player-canvas.tsx";
import { PlayOverlay } from "./components/play-overlay.tsx";
import { PlayerControls } from "./components/player-controls.tsx";

export interface GMLPlayerProps {
  /** A GML document, as XML or parsed. */
  gml: string | GML;
  autoPlay?: boolean;
  /** Initial loop setting; the loop button and R key toggle it. */
  defaultLoop?: boolean;
  speed?: number;
  /** Appearance of the drawing. Memoize it: a new object redraws the player. */
  renderOptions?: Partial<RenderOptions>;
  /** Show the control bar. */
  controls?: boolean;
  /** Show a thumbnail when hovering the seekbar. */
  preview?: boolean;
  /** Where keyboard shortcuts apply: while the player has focus, anywhere, or nowhere. */
  keyboard?: KeyboardMode;
  /** Called when Escape is pressed (outside fullscreen). */
  onEscape?: () => void;
  className?: string;
  style?: CSSProperties;
}

/** Plays a GML document on a canvas, with playback controls. It fills its container. */
export function GMLPlayer({
  gml,
  autoPlay = false,
  defaultLoop = true,
  speed = 1,
  renderOptions,
  controls = true,
  preview = true,
  keyboard = "focus",
  onEscape,
  className,
  style,
}: GMLPlayerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controller = useGMLPlayer(canvasRef, {
    gml,
    autoPlay,
    defaultLoop,
    speed,
    renderOptions,
  });
  const fullscreen = useFullscreen(rootRef);
  useKeyboardShortcuts(rootRef, controller, { mode: keyboard, onEscape });

  return (
    <PlayerContext.Provider value={controller}>
      <div
        ref={rootRef}
        className={classNames("gmlp-root", className)}
        style={style}
        role="region"
        aria-label="GML player"
        tabIndex={keyboard === "focus" ? 0 : undefined}
      >
        <PlayerCanvas canvasRef={canvasRef}>
          <PlayOverlay />
        </PlayerCanvas>
        {controls ? (
          <PlayerControls
            preview={preview}
            isFullscreen={fullscreen.isFullscreen}
            onToggleFullscreen={fullscreen.toggle}
          />
        ) : null}
      </div>
    </PlayerContext.Provider>
  );
}
