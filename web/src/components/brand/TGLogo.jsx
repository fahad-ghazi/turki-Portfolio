import React from "react";

// Cropped transparent brand mark — the "شعار مفرغ مقصوص" file the
// user picked. SVG keeps it crisp at every size without retina blur.
//
// The SVG lives in Cloudflare R2 (not in the git repo / public/).
// We apply VITE_R2_BASE at build time so the correct CDN URL is baked
// into the bundle — same pattern as toDeliveryUrl() in Picture.jsx.
const R2_BASE = import.meta.env.VITE_R2_BASE ?? "";
const LOGO_PATH = "/brand/turki-logo.svg";
const LOGO_URL = R2_BASE ? `${R2_BASE}${LOGO_PATH}` : LOGO_PATH;

const sizes = {
  sm: "h-14 w-20",
  md: "h-16 w-24",
  lg: "h-24 w-36",
};

export default function TGLogo({ size = "md", className = "" }) {
  return (
    <div className={`relative ${sizes[size]} ${className}`}>
      <img
        src={LOGO_URL}
        alt="Turki Studio"
        className="h-full w-full object-contain drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]"
        loading="eager"
        decoding="async"
      />
    </div>
  );
}