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
      // Get the URL and construct the new URL
      const url = new URL(request.url);
      
      // Extract the path from the request (e.g., /e/, /decide/, /array/, /flags/)
      const path = url.pathname;
      
      // Forward query parameters
      const searchParams = url.search;
      
      // Construct the target URL
      const targetUrl = `${POSTHOG_API_HOST}${path}${searchParams}`;
      
      // Clone the request
      const newRequest = new Request(targetUrl, request);
      
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
      
      // Update the request with modified headers
      newRequest.headers = headers;
      
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
      
      return newResponse;
      
    } catch (error) {
      console.error('PostHog proxy error:', error);
      return new Response(JSON.stringify({ error: 'Proxy error' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  }
};