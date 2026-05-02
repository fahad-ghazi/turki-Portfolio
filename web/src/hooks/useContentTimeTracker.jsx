import { useEffect } from "react";
import { trackContentTime } from "../utils/behaviorTracking";

export default function useContentTimeTracker(contentId, isActive = true, weight = 1) {
  useEffect(() => {
    if (!contentId || !isActive) return;

    const startedAt = Date.now();

    return () => {
      const seconds = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
      trackContentTime(contentId, seconds, weight);
    };
  }, [contentId, isActive, weight]);
}