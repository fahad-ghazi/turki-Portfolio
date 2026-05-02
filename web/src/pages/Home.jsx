import React from "react";
import DualNav from "../components/experience/DualNav";
import Seo from "@/components/seo/Seo";

const SITE_URL = (import.meta.env?.VITE_PUBLIC_SITE_URL || "https://turkighazi.com").replace(/\/$/, "");

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Turki Ghazi",
  alternateName: "تركي غازي",
  url: SITE_URL,
  jobTitle: "AI Visual Designer & Creative",
  description:
    "Turki Ghazi is an AI visual designer crafting cinematic worlds, commercial ads, fashion editorial, real estate visuals and Saudi heritage imagery using generative AI.",
  knowsAbout: [
    "AI visual design",
    "Cinematic short films",
    "Commercial advertising",
    "Fashion editorial",
    "Architectural visualization",
    "Saudi heritage",
  ],
  sameAs: [import.meta.env?.VITE_LINKEDIN_URL, import.meta.env?.VITE_INSTAGRAM_URL].filter(Boolean),
};

export default function Home() {
  return (
    <>
      <Seo
        canonical="/"
        ogType="website"
        jsonLd={personJsonLd}
      />
      <DualNav />
    </>
  );
}