import posthog from 'posthog-js';

// PostHog reads the server-side dead-clicks flag ($dead_clicks_enabled_server_side)
// from persisted storage at init time — BEFORE the /decide response arrives to
// correct it. Earlier testing left a stale `true` here, which made posthog
// lazy-load the dead-clicks addon on every page load; that load fails through
// the reverse proxy and logs "failed to load script". /decide now correctly
// returns captureDeadClicks: false, so strip any stale flag before init to
// prevent the load attempt entirely.
if (typeof window !== 'undefined') {
  try {
    for (let i = window.localStorage.length - 1; i >= 0; i--) {
      const key = window.localStorage.key(i);
      if (!key || !key.startsWith('__posthog')) continue;
      const raw = window.localStorage.getItem(key);
      if (!raw || !raw.includes('$dead_clicks_enabled_server_side')) continue;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && '$dead_clicks_enabled_server_side' in parsed) {
        delete parsed.$dead_clicks_enabled_server_side;
        window.localStorage.setItem(key, JSON.stringify(parsed));
      }
    }
  } catch {
    // localStorage unavailable/corrupt — safe to ignore.
  }
}

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
  // Reverse proxy on our own domain — bypasses ad blockers
  api_host: 'https://s.shravanrevanna.me',
  ui_host: 'https://us.posthog.com',
  defaults: '2026-01-30',
  person_profiles: 'always',

  // --- Enrichments (explicit overrides win over the `defaults` preset) ---
  // Pageviews fire on load (and on history changes if routes are ever added).
  capture_pageview: true,
  // Autocapture: element-level clicks, change, submit events with CSS selectors.
  autocapture: true,
  // JS exceptions and unhandled promise rejections → $exception events.
  capture_exceptions: true,
  // Core Web Vitals (LCP/INP/CLS/FCP/TTFB) → $web_vitals events. The web-vitals
  // code is bundled into the SDK, so it does not lazy-load through the proxy.
  capture_performance: { web_vitals: true },

  // Session replay is ON. The recorder lazy-loads from `${api_host}/static/recorder.js`,
  // which the reverse proxy serves from us-assets.i.posthog.com — verified working.
  // The earlier "could not load recorder" failures were caused by a stale
  // $dead_clicks_enabled_server_side flag forcing the dead-clicks addon to load
  // (stripped above), not by the recorder itself.
  disable_session_recording: false,
  // Record network activity alongside the DOM for richer replays.
  session_recording: {
    recordCrossOriginIframes: true,
  },
  // Keep dead-clicks off: its addon is the part that historically failed through
  // the proxy and we don't act on it for a static portfolio.
  capture_dead_clicks: false,

  debug: process.env.NODE_ENV === 'development',
});
