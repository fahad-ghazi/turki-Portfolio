import React from "react";
import { useNavigate } from "react-router-dom";
import HorizontalSwiper from "../components/feed/HorizontalSwiper";
import { CATEGORIES } from "../components/feed/categoriesData";

const category = CATEGORIES.find((c) => c.id === "commercial-ads");

export default function CommercialAds() {
  const navigate = useNavigate();

  return (
    <>
      <div className="sr-only">
        <h1>Turki Ghazi — Commercial Advertising & Product Visual Portfolio</h1>
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
          "name": "Commercial Ads — Turki Ghazi",
          "description": category.seoDescription,
          "url": "https://turkighazi.com/commercial-ads",
          "author": { "@type": "Person", "name": "Turki Ghazi" },
        })}</script>
      </div>

      <HorizontalSwiper
        items={category.items}
        categoryTitle={category.titleEn}
        onExit={() => navigate("/")}
      />
    </>
  );
}