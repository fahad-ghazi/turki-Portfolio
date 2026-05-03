import React from "react";
import { Link } from "react-router-dom";

/**
 * Unified pill button used across the public site (audit #40).
 *
 * Variants:
 *   primary   — gold-filled, dark text. The CTA on every page.
 *                e.g. "احجز مشروع"
 *   secondary — cream background with dark border. Lower priority CTA.
 *                e.g. "تحميل السيرة"
 *   ghost     — transparent with cream border, used over images / on
 *                dark backgrounds where neither primary nor secondary
 *                works.
 *   dark      — dark filled with cream text, for the home-return pill
 *                in the corner of subpages.
 *
 * Sizes: md (default, 14px), sm (12px), lg (16px).
 *
 * Renders <Link> for internal routes (`to` prop), <a> for external
 * URLs (`href`), <button> otherwise. The visual treatment is identical
 * across all three so consumers don't need to think about the tag.
 */
const VARIANTS = {
  primary:
    "border-2 border-[#C9A961] bg-[#C9A961] text-[#1A1A1A] hover:bg-[#F5F1E8] hover:text-[#1A1A1A]",
  secondary:
    "border-2 border-[#1A1A1A] bg-[#F5F1E8] text-[#1A1A1A] hover:border-[#C9A961]",
  ghost:
    "border-2 border-[#F5F1E8]/35 bg-transparent text-[#F5F1E8] hover:border-[#C9A961] hover:text-[#C9A961]",
  dark:
    "border-2 border-[#1A1A1A] bg-[#1A1A1A] text-[#F5F1E8] hover:border-[#C9A961] hover:text-[#C9A961]",
};

const SIZES = {
  sm: "px-5 py-2.5 text-sm",
  md: "px-7 py-3 text-base",
  lg: "px-9 py-3.5 text-base",
};

export default function Button({
  variant = "primary",
  size = "md",
  to,
  href,
  onClick,
  type = "button",
  children,
  className = "",
  disabled = false,
  icon: Icon,
  iconAfter = false,
  ...rest
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full font-noto font-bold transition disabled:cursor-not-allowed disabled:opacity-60";
  const variantClass = VARIANTS[variant] ?? VARIANTS.primary;
  const sizeClass = SIZES[size] ?? SIZES.md;
  const fullClass = `${base} ${variantClass} ${sizeClass} ${className}`.trim();

  const inner = (
    <>
      {Icon && !iconAfter && <Icon className="h-4 w-4" strokeWidth={1.6} />}
      <span>{children}</span>
      {Icon && iconAfter && <Icon className="h-4 w-4" strokeWidth={1.6} />}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={fullClass} onClick={onClick} {...rest}>
        {inner}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={fullClass} onClick={onClick} {...rest}>
        {inner}
      </a>
    );
  }
  return (
    <button
      type={type}
      className={fullClass}
      onClick={onClick}
      disabled={disabled}
      {...rest}
    >
      {inner}
    </button>
  );
}
