import { usePlayerState } from "../hooks/use-player-state.ts";
import { formatTime } from "../format-time.ts";
import { classNames } from "../class-names.ts";

// Whole seconds, so the display re-renders once per second rather than every frame.
const selectCurrentSeconds = (state: { currentTime: number }) => Math.floor(state.currentTime);
const selectTotalSeconds = (state: { totalTime: number }) => Math.floor(state.totalTime);

export function TimeDisplay({ className }: { className?: string }) {
  const currentTime = usePlayerState(selectCurrentSeconds);
  const totalTime = usePlayerState(selectTotalSeconds);
  return (
    <span className={classNames("gmlp-time", className)}>
      {formatTime(currentTime)} | {formatTime(totalTime)}
    </span>
  );
}
