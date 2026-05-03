import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";

/**
 * Fetch published portfolio_projects for a given work_type and merge with the
 * static fallback shipped in categoriesData.jsx. The component contract used
 * by HorizontalSwiper expects items shaped as:
 *
 *   { id, type, src, alt, title, description, descriptionEn? }
 *
 * The API rows store the same data as PortfolioProject (with images[] and
 * work_type). We re-shape them here.
 *
 * Behaviour:
 *   - while the request is in flight: returns the static items so there's
 *     never a blank screen
 *   - on success with data: returns the API items, ordered by display_order
 *   - on success with empty result: returns the static items (fallback)
 *   - on error: returns the static items + logs once
 *
 * That gives us "manage from /admin" without losing resilience if the API
 * is briefly unreachable.
 */
export default function useSectionItems(workType, fallbackItems) {
  const { data, isError } = useQuery({
    queryKey: ["public", "portfolio-projects", workType],
    queryFn: () =>
      apiClient.entities.PortfolioProject.list("display_order", 200).then((rows) =>
        Array.isArray(rows) ? rows.filter((r) => r.work_type === workType) : [],
      ),
    staleTime: 5 * 60 * 1000, // 5 min — static-ish content
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });

  if (isError) {
    return { items: fallbackItems, source: "static" };
  }

  if (!Array.isArray(data) || data.length === 0) {
    return { items: fallbackItems, source: "static" };
  }

  const apiItems = data.map((row) => ({
    id: row.id,
    type: row.video_url ? "video" : "image",
    src: (row.images && row.images[0]) || row.video_url || "",
    alt: row.alt_text || row.title,
    title: row.title,
    description: row.short_description || "",
    descriptionEn: row.detailed_description || "",
  }));
  return { items: apiItems, source: "api" };
}
