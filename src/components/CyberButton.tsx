// biome-ignore-all lint/a11y/noSvgWithoutTitle: The SVG frame is decorative; button text remains accessible.
import type { ButtonHTMLAttributes, ReactNode } from "react";

type CyberButtonVariant = "ghost" | "library" | "primary" | "secondary" | "success";
type CyberButtonSize = "sm" | "md" | "lg";

type CyberButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  iconEnd?: ReactNode;
  iconStart?: ReactNode;
  size?: CyberButtonSize;
  variant?: CyberButtonVariant;
  wide?: boolean;
};

export function CyberButton({
  children,
  className,
  iconEnd,
  iconStart,
  size = "md",
  type = "button",
  variant = "secondary",
  wide = false,
  ...props
}: CyberButtonProps) {
  const classes = [
    "cyber-button",
    `cyber-button-${variant}`,
    `cyber-button-${size}`,
    wide ? "is-wide" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} type={type} {...props}>
      <svg
        aria-hidden="true"
        className="cyber-button-frame"
        focusable="false"
        preserveAspectRatio="none"
        viewBox="0 0 240 52"
      >
        <path className="cyber-button-fill" d="M10 1H224L239 16V42L229 51H10L1 42V10L10 1Z" />
        <path className="cyber-button-edge" d="M10 1H224L239 16V42L229 51H10L1 42V10L10 1Z" />
        <path className="cyber-button-inner" d="M18 8H216L231 21V38L224 44H17L8 36V16L18 8Z" />
        <path className="cyber-button-glint" d="M24 7H96M151 7H211L226 20" />
      </svg>
      <span className="cyber-button-content">
        {iconStart && <span className="cyber-button-icon">{iconStart}</span>}
        <span className="cyber-button-label">{children}</span>
        {iconEnd && <span className="cyber-button-icon">{iconEnd}</span>}
      </span>
    </button>
  );
}
