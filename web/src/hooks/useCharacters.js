import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";

/**
 * Fetch published characters from /api/characters with the static
 * trainedCharacters array as a fallback. Mirrors useSectionItems —
 * the page never goes blank just because the API is briefly unreachable.
 */
export default function useCharacters(fallback) {
  const { data, isError } = useQuery({
    queryKey: ["public", "characters"],
    queryFn: () => apiClient.entities.Character.list("display_order", 50),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });

  if (isError || !Array.isArray(data) || data.length === 0) {
    return { characters: fallback, source: "static" };
  }

  // The API returns snake_case (name_en, profile_story…). The legacy
  // components expect camelCase (nameEn, profileStory). Re-shape.
  const reshaped = data.map((row) => ({
    id: row.id,
    code: row.code,
    name: row.name,
    nameEn: row.name_en,
    role: row.role,
    tone: row.tone,
    bio: row.bio,
    profileStory: row.profile_story,
    cover: row.cover,
    accent: row.accent,
    images: row.images || [],
  }));
  return { characters: reshaped, source: "api" };
}
