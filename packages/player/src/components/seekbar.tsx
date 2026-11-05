import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { usePlayerController } from "../context.ts";
import { usePlayerState } from "../hooks/use-player-state.ts";
import { usePointerDrag } from "../hooks/use-pointer-drag.ts";
import { formatTime } from "../utils/format-time.ts";
import { classNames } from "../utils/class-names.ts";
import { SeekbarPreview } from "./seekbar-preview.tsx";

export interface SeekbarProps {
  /** Show a thumbnail of the hovered position. */
  preview?: boolean;
  className?: string;
}

/** Delay before the preview hides after the pointer leaves, in ms. */
const PREVIEW_HIDE_DELAY = 300;

const selectPosition = (state: { position: number }) => state.position;
const selectFramePosition = (state: { framePosition: number }) => state.framePosition;
const selectReady = (state: { ready: boolean }) => state.ready;
const selectCurrentSeconds = (state: { currentTime: number }) => Math.floor(state.currentTime);

interface Hover {
  position: number;
  trackWidth: number;
}

export function Seekbar({ preview = true, className }: SeekbarProps) {
  const controller = usePlayerController();
  const position = usePlayerState(selectPosition);
  const framePosition = usePlayerState(selectFramePosition);
  const ready = usePlayerState(selectReady);
  const currentSeconds = usePlayerState(selectCurrentSeconds);

  const trackRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<Hover | null>(null);
  const [hoverVisible, setHoverVisible] = useState(false);
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHideTimeout = () => {
    if (hideTimeout.current !== null) {
      clearTimeout(hideTimeout.current);
      hideTimeout.current = null;
    }
  };
  useEffect(() => clearHideTimeout, []);

  const measure = useCallback((event: PointerEvent<HTMLElement>): Hover => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0) {
      return { position: 0, trackWidth: 0 };
    }
    return {
      position: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)),
      trackWidth: rect.width,
    };
  }, []);

  const drag = usePointerDrag({
    onStart: useCallback(() => controller.beginScrub(), [controller]),
    onMove: useCallback(
      (event: PointerEvent<HTMLElement>) => controller.scrubTo(measure(event).position),
      [controller, measure],
    ),
    onEnd: useCallback(() => controller.endScrub(), [controller]),
  });

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    drag.onPointerMove(event);
    if (preview && event.pointerType === "mouse") {
      clearHideTimeout();
      setHover(measure(event));
      setHoverVisible(true);
    }
  };

  const onPointerLeave = () => {
    clearHideTimeout();
    hideTimeout.current = setTimeout(() => setHoverVisible(false), PREVIEW_HIDE_DELAY);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      controller.seekTo(event.key === "Home" ? 0 : 1);
    }
  };

  return (
    <div
      className={classNames("gmlp-seekbar", !ready && "gmlp-seekbar--disabled", className)}
      role="slider"
      tabIndex={ready ? 0 : -1}
      aria-label="Seek"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(position * 100)}
      aria-valuetext={formatTime(currentSeconds)}
      aria-disabled={!ready || undefined}
      onPointerDown={drag.onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={drag.onPointerUp}
      onPointerCancel={drag.onPointerCancel}
      onPointerLeave={onPointerLeave}
      onKeyDown={onKeyDown}
    >
      <div ref={trackRef} className="gmlp-track">
        <div className="gmlp-track-fill" style={{ width: `${position * 100}%` }} />
        <div className="gmlp-track-frames" style={{ width: `${framePosition * 100}%` }} />
      </div>
      {preview && hover ? (
        <SeekbarPreview
          position={hover.position}
          trackWidth={hover.trackWidth}
          visible={hoverVisible}
        />
      ) : null}
    </div>
  );
}
