/**
 * Cloudflare Worker for PostHog Reverse Proxy
 * 
 * This worker proxies PostHog API requests from your own domain (s.shravanrevanna.me)
 * to PostHog's official endpoint, bypassing ad blockers.
 * 
 * Deploy this in Cloudflare Dashboard > Workers > Create Service
 * Then route s.shravanrevanna.me/* to this worker
 */

const POSTHOG_API_HOST = 'https://us.i.posthog.com';

  export default {
    async fetch(request, env, ctx) {
      try {
        const url = new URL(request.url);
        const path = url.pathname;
        const searchParams = url.search;
        const method = request.method;
        
        // Handle root path with a helpful message
        if (path === '/' || path === '') {
          return new Response(JSON.stringify({
            status: 'PostHog Proxy Running',
            message: 'This worker proxies PostHog API requests',
            endpoints: [
              'POST /e/ - Capture events',
              'POST /decide/ - Feature flags and experiments',
              'GET /array/* - Session recording data',
              'GET /config - PostHog configuration',
              'POST /flags/ - Feature flag decisions'
            ],
            example: 'POST /e/ with your event data'
          }), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });
        }
        
        // Construct the target URL
        const targetUrl = `${POSTHOG_API_HOST}${path}${searchParams}`;
        
        console.log(`Proxying ${method} ${path} to ${targetUrl}`);
        
        // Preserve all headers except host
        const headers = new Headers(request.headers);
        headers.set('Host', new URL(targetUrl).host);
        headers.set('X-Forwarded-Host', url.host);
        headers.set('X-Forwarded-Proto', url.protocol.replace(':', ''));
        
        // Remove any Cloudflare-specific headers that might cause issues
        headers.delete('cf-ray');
        headers.delete('cf-visitor');
        headers.delete('cf-connecting-ip');
        headers.delete('cf-ipcountry');
        
        // Create a new request with modified headers
        const newRequest = new Request(targetUrl, {
          method: request.method,
          headers: headers,
          body: request.body,
          redirect: request.redirect,
          cache: request.cache,
          credentials: request.credentials,
          integrity: request.integrity,
          keepalive: request.keepalive,
          mode: request.mode,
          referrer: request.referrer,
          referrerPolicy: request.referrerPolicy,
          signal: request.signal
        });
        
        // Fetch from PostHog
        const response = await fetch(newRequest);
        
        // Clone the response to modify headers
        const newResponse = new Response(response.body, response);
        
        // Set CORS headers
        newResponse.headers.set('Access-Control-Allow-Origin', '*');
        newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        
        // Handle preflight requests
        if (request.method === 'OPTIONS') {
          return new Response(null, {
            status: 204,
            headers: newResponse.headers
          });
        }
        
        console.log(`Response status: ${response.status} for ${path}`);
        return newResponse;
        
      } catch (error) {
        console.error('PostHog proxy error:', error.message);
        console.error('Error stack:', error.stack);
        return new Response(JSON.stringify({ 
          error: 'Proxy error', 
          message: error.message,
          hint: 'Check the worker logs for more details'
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
    }
  };
