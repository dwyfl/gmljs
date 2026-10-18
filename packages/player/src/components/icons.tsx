export interface IconProps {
  size?: number;
  className?: string;
}

function createIcon(path: string) {
  return function Icon({ size = 24, className }: IconProps) {
    return (
      <svg
        className={className}
        width={size}
        height={size}
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden
      >
        <path d={path} />
      </svg>
    );
  };
}

export const PlayIcon = createIcon("M8 5v14l11-7z");
export const PauseIcon = createIcon("M6 19h4V5H6v14zm8-14v14h4V5h-4z");
export const RepeatIcon = createIcon(
  "M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z",
);
export const FullscreenIcon = createIcon(
  "M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z",
);
export const FullscreenExitIcon = createIcon(
  "M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z",
);
