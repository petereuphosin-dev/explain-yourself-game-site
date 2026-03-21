(() => {
  const GA4_MEASUREMENT_ID = "GA4_MEASUREMENT_ID_HERE";
  const ENABLE_SCROLL_DEPTH_TRACKING = true;
  const ENABLE_TIME_ON_PAGE_TRACKING = true;
  const TIME_ON_PAGE_MS = 30000;
  const PLACEHOLDER_ID = "GA4_MEASUREMENT_ID_HERE";

  const isGaEnabled =
    typeof GA4_MEASUREMENT_ID === "string" &&
    GA4_MEASUREMENT_ID.trim() !== "" &&
    GA4_MEASUREMENT_ID !== PLACEHOLDER_ID;

  if (!isGaEnabled) {
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag() {
      window.dataLayer.push(arguments);
    };

  const gtagScript = document.createElement("script");
  gtagScript.async = true;
  gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA4_MEASUREMENT_ID)}`;
  document.head.appendChild(gtagScript);

  window.gtag("js", new Date());
  window.gtag("config", GA4_MEASUREMENT_ID, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false
  });

  const trackEvent = (eventName, params = {}) => {
    window.gtag("event", eventName, {
      page_path: window.location.pathname,
      page_title: document.title,
      ...params
    });
  };

  const initializeAnalytics = () => {
    const clickTargets = document.querySelectorAll("[data-analytics-event]");
    clickTargets.forEach((target) => {
      target.addEventListener("click", () => {
        trackEvent(target.dataset.analyticsEvent, {
          link_text: target.textContent?.trim() || "",
          link_url: target.getAttribute("href") || "",
          placement: target.dataset.analyticsPlacement || "unspecified"
        });
      });
    });

    if (ENABLE_SCROLL_DEPTH_TRACKING) {
      const thresholds = [25, 50, 75, 90];
      const firedThresholds = new Set();

      const handleScroll = () => {
        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (scrollableHeight <= 0) {
          return;
        }

        const scrollPercent = Math.round((window.scrollY / scrollableHeight) * 100);
        thresholds.forEach((threshold) => {
          if (scrollPercent >= threshold && !firedThresholds.has(threshold)) {
            firedThresholds.add(threshold);
            trackEvent("scroll_depth", {
              percent_scrolled: threshold
            });
          }
        });
      };

      window.addEventListener("scroll", handleScroll, { passive: true });
      handleScroll();
    }

    if (ENABLE_TIME_ON_PAGE_TRACKING) {
      let hasTrackedEngagement = false;

      window.setTimeout(() => {
        if (!hasTrackedEngagement && document.visibilityState === "visible") {
          hasTrackedEngagement = true;
          trackEvent("time_on_page_engaged", {
            engaged_time_seconds: TIME_ON_PAGE_MS / 1000
          });
        }
      }, TIME_ON_PAGE_MS);
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeAnalytics, { once: true });
  } else {
    initializeAnalytics();
  }
})();
