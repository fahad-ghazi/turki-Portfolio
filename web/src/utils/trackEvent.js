import { apiClient } from "@/api/client";

export async function trackEvent(eventName, data = {}) {
  await apiClient.entities.AnalyticsEvent.create({
    event_name: eventName,
    event_type: data.event_type || "button_click",
    page: data.page || window.location.pathname,
    section: data.section || "",
    target_id: data.target_id || "",
    referrer: document.referrer || "direct",
    device: /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop",
    browser: navigator.userAgent,
    privacy_consent: false,
  });
}