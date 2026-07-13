# Deploy PostHog Reverse Proxy on Cloudflare

This guide will help you deploy the PostHog reverse proxy to fix the `net::ERR_NAME_NOT_RESOLVED` errors.

## Problem

Your website is trying to send analytics to `https://s.shravanrevanna.me`, but this subdomain doesn't exist in DNS, causing all PostHog requests to fail.

## Solution

Deploy a Cloudflare Worker that proxies requests from `s.shravanrevanna.me` to PostHog's official endpoint (`us.i.posthog.com`), while bypassing ad blockers.

## Step 1: Deploy the Cloudflare Worker

1. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages**
3. Click **"Create application"**
4. Click **"Create Worker"**
5. Give it a name like `posthog-proxy`
6. Click **"Deploy"**
7. Click **"Edit code"**
8. Replace all the code with the content from `cloudflare-worker.js` in your project
9. Click **"Deploy"** (top right)
10. Your worker is now ready!

## Step 2: Create Workers Route

1. In the Cloudflare Dashboard, go to **Workers & Pages** > **Routes**
2. Click **"Add route"**
3. For the route, enter: `s.shravanrevanna.me/*`
4. For the worker, select `posthog-proxy` (or whatever you named it)
5. Click **"Save"**

## Step 3: Verify DNS Setup

Your DNS should already be configured since you're using Cloudflare:

- `shravanrevanna.me` → A record → points to your hosting
- `*.shravanrevanna.me` → CNAME → points to `shravanrevanna.me` (wildcard)

This wildcard ensures `s.shravanrevanna.me` resolves correctly.

## Step 4: Test the Proxy

After setting up the route, test it:

```bash
# Test a sample event
curl -X POST "https://s.shravanrevanna.me/e/?ip=0" \
  -H "Content-Type: application/json" \
  -d '{"test":"data"}'
```

If successful, you should get a response from PostHog.

## Step 5: Verify in Your Website

1. Clear your browser cache
2. Open your website: `https://shravanrevanna.me`
3. Open Developer Tools (F12) > Network tab
4. Look for requests to `s.shravanrevanna.me`
5. They should now succeed (status 200) instead of failing with `ERR_NAME_NOT_RESOLVED`

## How It Works

```
Browser → s.shravanrevanna.me → Cloudflare Worker → us.i.posthog.com → PostHog
```

The worker:
- Receives requests from `s.shravanrevanna.me`
- Forwards them to `us.i.posthog.com`
- Preserves all headers, query parameters, and body
- Returns the response to your browser
- Bypasses ad blockers that would block direct PostHog requests

## Troubleshooting

### Worker returns 5xx errors

- Check the Worker logs in Cloudflare Dashboard
- Verify the worker code was copied correctly
- Make sure the route is set up correctly

### DNS still not resolving

- Go to Cloudflare Dashboard > DNS
- Ensure you have a wildcard CNAME: `*` → `shravanrevanna.me`
- Wait for DNS propagation (usually a few minutes)

### Requests still failing

- Check browser console for CORS errors
- Verify the worker is handling OPTIONS requests
- Make sure your site's domain matches what's in PostHog settings

## Notes

- The worker uses `us.i.posthog.com` as the PostHog endpoint
- All PostHog endpoints (`/e/`, `/decide/`, `/array/`, `/flags/`) are proxied
- CORS headers are set to allow requests from any origin
- The worker is lightweight and fast (Cloudflare Workers have minimal latency)

## Cost

Cloudflare Workers has a generous free tier:
- 100,000 requests/day
- 10ms CPU time per request

Your PostHog analytics traffic will easily fit within this limit.