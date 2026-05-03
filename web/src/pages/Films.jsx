import React, { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import FilmsListScreen from "../components/films/FilmsListScreen";
import FilmDetailScreen from "../components/films/FilmDetailScreen";
import { FILMS } from "../components/films/filmsData";
import { sortByBehavior, trackContentInteraction } from "../utils/behaviorTracking";
import Seo from "@/components/seo/Seo";

export default function Films() {
  const [selectedFilm, setSelectedFilm] = useState(null);
  const { data: adminFilms = [] } = useQuery({
    queryKey: ["films"],
    queryFn: () => base44.entities.Film.list("display_order", 50),
  });

  const films = useMemo(() => {
    const publishedFilms = adminFilms.filter((film) => film.publish_status !== "archived");
    if (!publishedFilms.length) return FILMS;
    return publishedFilms.map((film) => ({
      id: film.id,
      title: film.title,
      duration: film.duration || "--:--",
      year: film.year || "2026",
      description: film.description || "فيلم سينمائي قصير من تركي استديو.",
      videoUrl: film.video_url || null,
      thumbnail: film.thumbnail,
    }));
  }, [adminFilms]);

  const rankedFilms = useMemo(() => sortByBehavior(films), [films, selectedFilm]);

  const handleSelectFilm = (film) => {
    trackContentInteraction(film.id, 4);
    setSelectedFilm(film);
  };

  return (
    <>
      <Seo
        title="الأفلام"
        description="مجموعة أفلام قصيرة سينمائية من تركي استديو — قصص بصرية مصنوعة بالذكاء الاصطناعي."
        canonical="/films"
      />
      <AnimatePresence mode="wait">
        {selectedFilm ? (
          <FilmDetailScreen key={selectedFilm.id} film={selectedFilm} films={rankedFilms} onBack={() => setSelectedFilm(null)} onSelect={handleSelectFilm} />
        ) : (
          <FilmsListScreen key="films-list" films={rankedFilms} onSelect={handleSelectFilm} />
        )}
      </AnimatePresence>
    </>
  );
}