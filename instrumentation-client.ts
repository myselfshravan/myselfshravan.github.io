import posthog from 'posthog-js';

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
  // Use environment variable for API host, fallback to official PostHog endpoint
  // This ensures analytics work even if custom proxy DNS isn't configured yet
  api_host: process.env.NEXT_PUBLIC_POSTHOG_API_HOST || 'https://us.i.posthog.com',
  ui_host: 'https://us.posthog.com',
  defaults: '2026-01-30',
  // Always create person profiles so firebase_user_id lands on every visitor
  person_profiles: 'always',
  capture_exceptions: true,
  debug: process.env.NODE_ENV === 'development',
});
