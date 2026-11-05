import { usePlayerState } from "../hooks/use-player-state.ts";
import { classNames } from "../utils/class-names.ts";
import { PlayIcon } from "./icons.tsx";

const selectVisible = (state: { ready: boolean; hasStarted: boolean }) =>
  state.ready && !state.hasStarted;

/** A large play symbol, shown until playback starts. Clicks pass through to the canvas. */
export function PlayOverlay({ className }: { className?: string }) {
  const visible = usePlayerState(selectVisible);
  if (!visible) {
    return null;
  }
  return (
    <div className={classNames("gmlp-overlay", className)} aria-hidden>
      <div className="gmlp-overlay-button">
        <PlayIcon size={48} />
      </div>
    </div>
  );
}
