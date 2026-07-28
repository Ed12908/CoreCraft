// biome-ignore-all lint/a11y/noSvgWithoutTitle: Decorative icons are hidden from assistive tech.
import type { SVGProps } from "react";

type UiIconName =
  | "and"
  | "arrow"
  | "check"
  | "chip"
  | "circuit"
  | "lamp"
  | "lock"
  | "not"
  | "or"
  | "play"
  | "refresh"
  | "reset"
  | "sigma"
  | "spark"
  | "switch"
  | "wave"
  | "xor"
  | "xp";

type UiIconProps = {
  name: UiIconName;
  className?: string;
};

export function UiIcon({ name, className }: UiIconProps) {
  const common: SVGProps<SVGSVGElement> = {
    "aria-hidden": true,
    className: `ui-icon ${className ?? ""}`,
    focusable: false,
    viewBox: "0 0 24 24",
  };

  switch (name) {
    case "and":
      return (
        <svg {...common}>
          <path d="M4 6h7a6 6 0 0 1 0 12H4V6Z" />
          <path d="M2.5 9H4M2.5 15H4M17 12h4.5" />
        </svg>
      );
    case "arrow":
      return (
        <svg {...common}>
          <path d="M9 5l7 7-7 7M16 12H4" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <path d="m5 12 4 4 10-10" />
        </svg>
      );
    case "chip":
      return (
        <svg {...common}>
          <rect height="12" rx="2" width="12" x="6" y="6" />
          <rect height="5" rx="1" width="5" x="9.5" y="9.5" />
          <path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" />
        </svg>
      );
    case "circuit":
      return (
        <svg {...common}>
          <path d="M5 5v5h6v4h8" />
          <path d="M5 19v-5h6M14 5h5v5" />
          <circle cx="5" cy="5" r="1.5" />
          <circle cx="5" cy="19" r="1.5" />
          <circle cx="19" cy="10" r="1.5" />
        </svg>
      );
    case "lamp":
      return (
        <svg {...common}>
          <path d="M9 17h6M10 21h4M8 13a6 6 0 1 1 8 0c-1 1-1.5 2-1.5 4h-5c0-2-.5-3-1.5-4Z" />
        </svg>
      );
    case "lock":
      return (
        <svg {...common}>
          <rect height="10" rx="2" width="14" x="5" y="11" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
      );
    case "not":
      return (
        <svg {...common}>
          <path d="M4 5v14l11-7L4 5Z" />
          <circle cx="18" cy="12" r="2" />
        </svg>
      );
    case "or":
      return (
        <svg {...common}>
          <path d="M4 5c4 3 4 11 0 14 7-1 11-3 16-7C15 8 11 6 4 5Z" />
          <path d="M3 8c3 2.5 3 5.5 0 8" />
        </svg>
      );
    case "play":
      return (
        <svg {...common}>
          <path d="M8 5v14l11-7-11-7Z" />
        </svg>
      );
    case "refresh":
      return (
        <svg {...common}>
          <path d="M20 12a8 8 0 1 1-2.3-5.7" />
          <path d="M20 4v6h-6" />
        </svg>
      );
    case "reset":
      return (
        <svg {...common}>
          <path d="M4 12a8 8 0 1 0 2.3-5.7" />
          <path d="M4 4v6h6" />
        </svg>
      );
    case "sigma":
      return (
        <svg {...common}>
          <path d="M18 5H7l6 7-6 7h11" />
        </svg>
      );
    case "spark":
      return (
        <svg {...common}>
          <path d="m12 2 2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4L12 2Z" />
          <path d="M5 4l1 2M19 18l-1-2" />
        </svg>
      );
    case "switch":
      return (
        <svg {...common}>
          <path d="M4 12h4M16 12h4" />
          <circle cx="12" cy="12" r="4" />
          <path d="M12 8V4M12 20v-4" />
        </svg>
      );
    case "wave":
      return (
        <svg {...common}>
          <path d="M3 12h3l2-5 4 10 3-8 2 3h4" />
        </svg>
      );
    case "xor":
      return (
        <svg {...common}>
          <path d="M6 5c4 3 4 11 0 14 6.5-1 10.5-3 15-7-4.5-4-8.5-6-15-7Z" />
          <path d="M2.5 6c4 3.5 4 8.5 0 12M5 8c3 2.5 3 5.5 0 8" />
        </svg>
      );
    case "xp":
      return (
        <svg {...common}>
          <path d="M12 3 20 7v10l-8 4-8-4V7l8-4Z" />
          <path d="m8 9 8 6M16 9l-8 6M12 6v12" />
        </svg>
      );
  }
}
