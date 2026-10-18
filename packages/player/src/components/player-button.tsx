import type { MouseEventHandler, ReactNode } from "react";
import { classNames } from "../class-names.ts";

export interface PlayerButtonProps {
  onClick?: MouseEventHandler<HTMLButtonElement>;
  title?: string;
  active?: boolean;
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
}

export function PlayerButton({
  onClick,
  title,
  active = false,
  disabled = false,
  className,
  children,
}: PlayerButtonProps) {
  return (
    <button
      type="button"
      className={classNames("gmlp-button", active && "gmlp-button--active", className)}
      onClick={onClick}
      title={title}
      aria-label={title}
      aria-pressed={active || undefined}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
