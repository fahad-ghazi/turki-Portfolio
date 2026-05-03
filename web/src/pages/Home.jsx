import React from "react";
import DualNav from "../components/experience/DualNav";
import Seo from "@/components/seo/Seo";

const SITE_URL = (import.meta.env?.VITE_PUBLIC_SITE_URL || "https://turkistudio.ai").replace(/\/$/, "");

// Audit #25: ship a richer schema graph on the homepage so AI search
// engines and Google rich results understand the studio (Person), the
// services it offers, and the questions clients commonly ask.

const homeGraph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${SITE_URL}#person`,
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
      sameAs: [
        import.meta.env?.VITE_LINKEDIN_URL,
        import.meta.env?.VITE_INSTAGRAM_URL,
      ].filter(Boolean),
    },
    {
      "@type": "ProfessionalService",
      "@id": `${SITE_URL}#studio`,
      name: "Turki Studio",
      url: SITE_URL,
      areaServed: { "@type": "Place", name: "Saudi Arabia" },
      founder: { "@id": `${SITE_URL}#person` },
      knowsAbout: ["Generative AI", "Brand visuals", "Cinematic storytelling"],
      makesOffer: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "AI Commercial Advertising",
            description:
              "إعلانات تجارية وإعلانات منتجات مصنوعة بالذكاء الاصطناعي بهوية بصرية متماسكة.",
            url: `${SITE_URL}/commercial-ads`,
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "AI Fashion Editorial",
            description:
              "تصميم أزياء وحملات إعلانية فاخرة بأسلوب editorial باستخدام الذكاء الاصطناعي.",
            url: `${SITE_URL}/ai-fashion`,
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Real Estate Visualization",
            description: "تصورات معمارية وعقارية فاخرة بجودة سينمائية.",
            url: `${SITE_URL}/real-estate`,
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Heritage & Cultural Imagery",
            description:
              "محتوى بصري للتراث السعودي والخليجي بطابع سينمائي معاصر.",
            url: `${SITE_URL}/heritage`,
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Cinematic Short Films",
            description: "أفلام قصيرة سينمائية مصممة بالذكاء الاصطناعي.",
            url: `${SITE_URL}/films`,
          },
        },
      ],
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "ما هي الخدمات التي يقدمها تركي غازي؟",
          acceptedAnswer: {
            "@type": "Answer",
            text: "إعلانات تجارية، أزياء بالذكاء الاصطناعي، تصورات عقارية ومعمارية، محتوى تراثي سعودي، وأفلام قصيرة سينمائية.",
          },
        },
        {
          "@type": "Question",
          name: "كيف أحجز مشروعاً مع تركي استديو؟",
          acceptedAnswer: {
            "@type": "Answer",
            text: "يمكنك ملء نموذج الحجز في صفحة /booking وستصلك ردّ خلال 48 ساعة عمل.",
          },
        },
        {
          "@type": "Question",
          name: "هل تعمل خارج السعودية؟",
          acceptedAnswer: {
            "@type": "Answer",
            text: "نعم — تركي استديو يعمل مع علامات تجارية في السعودية والخليج، ومتاح للتعاون الدولي عن بُعد.",
          },
        },
      ],
    },
  ],
};

export default function Home() {
  return (
    <>
      <Seo canonical="/" ogType="website" jsonLd={homeGraph} />
      <DualNav />
    </>
  );
}
