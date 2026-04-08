import posthog from 'posthog-js';

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
  // Managed reverse proxy — bypasses ad blockers
  api_host: 'https://s.shravanrevanna.me',
  ui_host: 'https://us.posthog.com',
  defaults: '2026-01-30',
  // Always create person profiles so firebase_user_id lands on every visitor
  person_profiles: 'always',
  capture_exceptions: true,
  debug: process.env.NODE_ENV === 'development',
});
