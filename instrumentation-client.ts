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
  capture_exceptions: true,
  // Disable the two features whose lazy-loaded addons fail to load through the
  // proxy ("could not load recorder" / "failed to load script"). The `defaults`
  // preset enables both; explicit flags override it (explicit config is spread
  // after the preset). We don't use session replays or dead-click analytics on a
  // static portfolio.
  disable_session_recording: true,
  capture_dead_clicks: false,
  debug: process.env.NODE_ENV === 'development',
});
