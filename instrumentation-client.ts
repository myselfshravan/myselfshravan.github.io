import posthog from 'posthog-js';

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
  api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  ui_host: 'https://us.posthog.com',
  // Include the defaults option as required by PostHog
  defaults: '2026-01-30',
  // Only create person profiles for identified users (cheaper)
  person_profiles: 'identified_only',
  // Enables capturing unhandled exceptions via Error Tracking
  capture_exceptions: true,
  // Turn on debug in development mode
  debug: process.env.NODE_ENV === 'development',
});
