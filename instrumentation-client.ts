import posthog from 'posthog-js';

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
  // Reverse proxy on our own domain — bypasses ad blockers
  api_host: 'https://s.shravanrevanna.me',
  ui_host: 'https://us.posthog.com',
  defaults: '2026-01-30',
  person_profiles: 'always',
  capture_exceptions: true,
  debug: process.env.NODE_ENV === 'development',
});