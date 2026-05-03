import React from "react";

// Cropped transparent brand mark — the "شعار مفرغ مقصوص" file the
// user picked. SVG keeps it crisp at every size without retina blur.
const LOGO_URL = "/brand/turki-logo.svg";

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