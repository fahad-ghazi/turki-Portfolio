import { base44 } from "@/api/base44Client";

const STORAGE_KEY = "tg_behavior_scores";

const readScores = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : {};
};

const writeScores = (scores) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
};

export function trackContentInteraction(id, weight = 1) {
  const scores = readScores();
  scores[id] = (scores[id] || 0) + weight;
  writeScores(scores);

  base44.entities.AnalyticsEvent.create({
    event_name: "project_visit",
    event_type: "project_view",
    page: window.location.pathname,
    target_id: id,
    device: /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop",
    browser: navigator.userAgent,
    privacy_consent: false,
  });
}

export function trackContentTime(id, seconds = 1, weight = 1) {
  const timeWeight = Math.max(1, seconds) * weight;
  trackContentInteraction(id, timeWeight);

  base44.entities.AnalyticsEvent.create({
    event_name: "project_time_spent",
    event_type: "project_view",
    page: window.location.pathname,
    target_id: id,
    session_duration: Math.max(1, seconds),
    device: /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop",
    browser: navigator.userAgent,
    privacy_consent: false,
  });
}

export function sortByBehavior(items) {
  const scores = readScores();
  return [...items].sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0));
}

export function getRecommendedItems(items, currentId, limit = 3) {
  const scores = readScores();
  const current = items.find((item) => item.id === currentId);

  return [...items]
    .filter((item) => item.id !== currentId)
    .sort((a, b) => {
      const sameYearA = current?.year && a.year === current.year ? 6 : 0;
      const sameYearB = current?.year && b.year === current.year ? 6 : 0;
      return (scores[b.id] || 0) + sameYearB - ((scores[a.id] || 0) + sameYearA);
    })
    .slice(0, limit);
}