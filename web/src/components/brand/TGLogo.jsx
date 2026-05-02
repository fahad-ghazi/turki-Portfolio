import React from "react";

const LOGO_URL = "https://media.base44.com/images/public/69f618d78f528f5ed96d2f9c/5c635a979_.png";

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
        alt="Turki Ghazi logo"
        className="h-full w-full object-contain drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]"
        loading="eager"
        decoding="async"
      />
    </div>
  );
}