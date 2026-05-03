import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import CharacterRoster from "@/components/characters/CharacterRoster";
import CharacterShowcase from "@/components/characters/CharacterShowcase";
import { trainedCharacters as staticCharacters } from "@/components/characters/trainedCharactersData";
import TGLogo from "@/components/brand/TGLogo";
import Eyebrow from "@/components/brand/Eyebrow";
import Seo from "@/components/seo/Seo";
import useCharacters from "@/hooks/useCharacters";
import Picture from "@/components/brand/Picture";
export default function TrainedModels() {
  // Phase 2: characters come from /api/characters with the static array
  // as a fallback. The admin manages them from /admin → characters.
  const { characters: trainedCharacters } = useCharacters(staticCharacters);
  const featuredCharacters = useMemo(
    () => trainedCharacters.filter((character) => ["layla-03", "omar-04"].includes(character.id)),
    [trainedCharacters],
  );
  const initialId = new URLSearchParams(window.location.search).get("character");
  const [selectedCharacter, setSelectedCharacter] = useState(
    () => trainedCharacters.find((character) => character.id === initialId) || trainedCharacters[0],
  );

  const selectCharacter = (character) => {
    setSelectedCharacter(character);
    window.history.replaceState(null, "", `/trained-models?character=${character.id}`);
  };

  return (
    <main className="min-h-screen bg-[#F5F1E8] px-4 py-6 text-[#1A1A1A] md:px-8" dir="rtl">
      <Seo
        title="الشخصيات المدرّبة"
        description="مجموعة شخصيات بصرية مدرّبة على الذكاء الاصطناعي بهوية ثابتة عبر الحملات والمشاريع."
        canonical="/trained-models"
      />
      <div className="mx-auto max-w-7xl">
        <aside className="fixed left-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-4 rounded-full border border-[#C9A961]/25 bg-[#1A1A1A]/80 p-2 shadow-2xl shadow-black/20 backdrop-blur-xl md:flex">
          {trainedCharacters.map((character) => (
            <button
              key={character.id}
              onClick={() => selectCharacter(character)}
              className={`group relative h-16 w-16 overflow-hidden rounded-full border transition-all duration-300 ${selectedCharacter.id === character.id ? "scale-110 border-[#C9A961] shadow-lg shadow-[#C9A961]/25" : "border-[#C9A961]/25 opacity-70 hover:scale-105 hover:opacity-100"}`}
              aria-label={`عرض معرض ${character.name}`}
            >
              <Picture src={character.cover} alt={character.name} className="h-full w-full object-cover object-top" />
              <span className="absolute inset-0 bg-gradient-to-tr from-[#C9A961]/55 via-transparent to-black/45 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-[#F5F1E8] px-2 py-0.5 font-noto text-[9px] font-bold text-[#1A1A1A]">{character.name}</span>
            </button>
          ))}
        </aside>

        <header className="mb-6 flex items-center justify-between">
          <Link to="/" className="flex h-11 w-11 items-center justify-center rounded-full border border-[#C9A961]/45 bg-[#1A1A1A] text-[#C9A961] transition hover:scale-105" aria-label="الرئيسية">
            <ArrowRight className="h-5 w-5" strokeWidth={1.5} />
          </Link>
          <TGLogo size="sm" />
        </header>

        <section className="mb-8 grid gap-6 rounded-[2rem] border border-[#C9A961]/18 bg-[#E9E2D3]/45 p-6 md:grid-cols-[1fr_auto] md:p-8">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-[#C9A961]" strokeWidth={1.4} />
              <Eyebrow ar="شخصيات مدرّبة" en="Trained Characters" />
            </div>
            <h1 className="font-noto text-5xl font-bold leading-tight md:text-7xl">الشخصيات المدرّبة</h1>
            <p className="mt-5 max-w-2xl font-noto text-sm leading-8 text-[#1A1A1A]/70 md:text-base">
              اختر شخصية من الفهرس، ثم استعرض زواياها بشكل مستقل: أمامي، جانبي، كلوز أب، ابتسامة، ولقطات مرجعية تحافظ على نفس الهوية البصرية عبر الحملات.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center md:min-w-80">
            <div className="rounded-2xl border border-[#C9A961]/20 bg-[#F5F1E8]/70 p-4">
              <p className="font-cinzel text-3xl text-[#C9A961]">{trainedCharacters.length}</p>
              <p className="mt-2 font-noto text-xs text-[#1A1A1A]/60">شخصيات</p>
            </div>
            <div className="rounded-2xl border border-[#C9A961]/20 bg-[#F5F1E8]/70 p-4">
              <p className="font-cinzel text-3xl text-[#C9A961]">{trainedCharacters.reduce((sum, c) => sum + c.images.length, 0)}</p>
              <p className="mt-2 font-noto text-xs text-[#1A1A1A]/60">زاوية</p>
            </div>
            <div className="rounded-2xl border border-[#C9A961]/20 bg-[#F5F1E8]/70 p-4">
              <p className="font-cinzel text-3xl text-[#C9A961]">4K</p>
              <p className="mt-2 font-noto text-xs text-[#1A1A1A]/60">جاهزة</p>
            </div>
          </div>
        </section>

        <div className="mb-8 grid gap-4 md:grid-cols-2">
          {featuredCharacters.map((character) => (
            <button
              key={character.id}
              onClick={() => selectCharacter(character)}
              className={`group relative min-h-72 overflow-hidden rounded-[2rem] border text-right transition-all duration-500 ${selectedCharacter.id === character.id ? "border-[#C9A961] shadow-xl shadow-[#C9A961]/15" : "border-[#C9A961]/20 hover:border-[#C9A961]/70"}`}
            >
              <Picture src={character.cover} alt={character.name} className="absolute inset-0 h-full w-full object-cover object-top transition duration-700 group-hover:scale-105" />
              <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
              <span className="absolute inset-0 bg-gradient-to-tr from-[#C9A961]/35 via-transparent to-black/20 opacity-0 transition duration-500 group-hover:opacity-100" />
              <div className="absolute bottom-0 right-0 left-0 p-6 text-[#F5F1E8]">
                <p className="font-noto text-xs font-bold tracking-[0.18em] text-[#C9A961]">شخصية مميّزة · {character.code}</p>
                <h2 className="mt-3 font-noto text-5xl font-bold">{character.name}</h2>
                <p className="mt-3 max-w-md font-noto text-sm leading-7 text-[#F5F1E8]/75">{character.profileStory || character.role}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="mb-8">
          <CharacterRoster characters={trainedCharacters} selectedId={selectedCharacter.id} onSelect={selectCharacter} />
        </div>

        <div className="mb-5 flex gap-2 overflow-x-auto pb-2 md:hidden">
          {trainedCharacters.map((character) => (
            <button
              key={character.id}
              onClick={() => selectCharacter(character)}
              className={`flex min-w-fit items-center gap-2 rounded-full border px-3 py-2 ${selectedCharacter.id === character.id ? "border-[#C9A961] bg-[#1A1A1A] text-[#F5F1E8]" : "border-[#1A1A1A]/15 bg-[#E9E2D3]/60 text-[#1A1A1A]"}`}
            >
              <Picture src={character.cover} alt={character.name} className="h-8 w-8 rounded-full object-cover object-top" />
              <span className="font-noto text-xs font-bold">{character.name}</span>
            </button>
          ))}
        </div>

        <CharacterShowcase character={selectedCharacter} />
      </div>
    </main>
  );
}