import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import HorizontalSwiper from "../components/feed/HorizontalSwiper";
import { CATEGORIES } from "../components/feed/categoriesData";
import Seo from "@/components/seo/Seo";

const category = CATEGORIES.find((c) => c.id === "ai-fashion");

export default function AiFashion() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);

  const handleExit = () => navigate("/");

  return (
    <>
      <Seo
        title="أزياء بالذكاء الاصطناعي"
        description={category.seoDescription}
        canonical="/ai-fashion"
      />
      {/* SEO Text Layer — hidden visually but indexable */}
      <div className="sr-only">
        <h1>Turki Ghazi — AI Fashion Visual Design Portfolio</h1>
        <p>{category.seoDescription}</p>
        <ul>
          {category.items.map((item) => (
            <li key={item.id}>
              <h2>{item.title}</h2>
              <p>{item.description}</p>
              <img src={item.src} alt={item.alt} />
            </li>
          ))}
        </ul>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "AI Fashion — Turki Ghazi",
          "description": category.seoDescription,
          "url": "https://turkistudio.ai/ai-fashion",
          "author": { "@type": "Person", "name": "Turki Ghazi" },
        })}</script>
      </div>

      {/* Cinematic Swiper Experience */}
      <HorizontalSwiper
        items={category.items}
        categoryTitle={category.titleEn}
        categoryId={category.id}
        onExit={handleExit}
      />
    </>
  );
}