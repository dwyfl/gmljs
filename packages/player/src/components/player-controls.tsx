import { usePlayerController } from "../context.ts";
import { usePlayerState } from "../hooks/use-player-state.ts";
import { classNames } from "../utils/class-names.ts";
import { PlayerButton } from "./player-button.tsx";
import { Seekbar } from "./seekbar.tsx";
import { TimeDisplay } from "./time-display.tsx";
import { FullscreenExitIcon, FullscreenIcon, PauseIcon, PlayIcon, RepeatIcon } from "./icons.tsx";
import { selectIsLooping, selectIsPlaying, selectReady } from "../utils/selectors.ts";

export interface PlayerControlsProps {
  /** Show a thumbnail when hovering the seekbar. */
  preview?: boolean;
  isFullscreen?: boolean;
  /** Without it, the fullscreen button is hidden. */
  onToggleFullscreen?: () => void;
  className?: string;
}

/** The control bar: play/pause, loop, time, seekbar and fullscreen. */
export function PlayerControls({
  preview = true,
  isFullscreen = false,
  onToggleFullscreen,
  className,
}: PlayerControlsProps) {
  const controller = usePlayerController();
  const isPlaying = usePlayerState(selectIsPlaying);
  const isLooping = usePlayerState(selectIsLooping);
  const ready = usePlayerState(selectReady);

  return (
    <div className={classNames("gmlp-controls", className)}>
      <PlayerButton
        onClick={() => controller.togglePlay()}
        title={isPlaying ? "Pause" : "Play"}
        disabled={!ready}
      >
        {isPlaying ? <PauseIcon size={16} /> : <PlayIcon size={16} />}
      </PlayerButton>
      <PlayerButton
        onClick={() => controller.toggleLoop()}
        title={isLooping ? "Disable loop" : "Enable loop"}
        active={isLooping}
        disabled={!ready}
      >
        <RepeatIcon size={16} />
      </PlayerButton>
      <TimeDisplay />
      <Seekbar preview={preview} />
      {onToggleFullscreen ? (
        <PlayerButton
          onClick={onToggleFullscreen}
          title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? <FullscreenExitIcon size={16} /> : <FullscreenIcon size={16} />}
        </PlayerButton>
      ) : null}
    </div>
  );
}
