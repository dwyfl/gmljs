import { usePlayerState } from "../hooks/use-player-state.ts";
import { formatTime } from "../utils/format-time.ts";
import { classNames } from "../utils/class-names.ts";
import { selectCurrentSeconds, selectTotalSeconds } from "../utils/selectors.ts";

export function TimeDisplay({ className }: { className?: string }) {
  const currentTime = usePlayerState(selectCurrentSeconds);
  const totalTime = usePlayerState(selectTotalSeconds);
  return (
    <span className={classNames("gmlp-time", className)}>
      {formatTime(currentTime)} | {formatTime(totalTime)}
    </span>
  );
}
