import React from "react";
import { useNavigate } from "react-router-dom";
import HorizontalSwiper from "../components/feed/HorizontalSwiper";
import { CATEGORIES } from "../components/feed/categoriesData";
import Seo from "@/components/seo/Seo";

const category = CATEGORIES.find((c) => c.id === "real-estate");

export default function RealEstate() {
  const navigate = useNavigate();

  return (
    <>
      <Seo
        title="عقارات بالذكاء الاصطناعي"
        description={category.seoDescription}
        canonical="/real-estate"
      />
      <div className="sr-only">
        <h1>Turki Ghazi — Real Estate & Architectural Visual Portfolio</h1>
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
          "name": "Real Estate — Turki Ghazi",
          "description": category.seoDescription,
          "url": "https://turkistudio.ai/real-estate",
          "author": { "@type": "Person", "name": "Turki Ghazi" },
        })}</script>
      </div>

      <HorizontalSwiper
        items={category.items}
        categoryTitle={category.titleEn}
        categoryId={category.id}
        onExit={() => navigate("/")}
      />
    </>
  );
}