/**
 * PostHog Reverse Proxy Worker
 * 
 * Proxies s.shravanrevanna.me -> us.i.posthog.com / us-assets.i.posthog.com
 * Being on your own domain bypasses ad blockers.
 */

const POSTHOG_HOST = 'us.i.posthog.com';
const POSTHOG_ASSETS_HOST = 'us-assets.i.posthog.com';

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Health check
    if (path === '/' || path === '/health') {
      return new Response(JSON.stringify({ status: 'ok', service: 'posthog-proxy' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }

    // Static assets go to us-assets, everything else to us
    const targetHost = path.startsWith('/static/') ? POSTHOG_ASSETS_HOST : POSTHOG_HOST;
    const targetUrl = `https://${targetHost}${path}${url.search}`;

    // Clean headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.delete('host');
    requestHeaders.delete('cf-connecting-ip');
    requestHeaders.delete('cf-ipcountry');
    requestHeaders.delete('cf-ray');
    requestHeaders.delete('cf-visitor');
    requestHeaders.delete('x-forwarded-for');
    requestHeaders.delete('x-forwarded-proto');
    requestHeaders.delete('x-real-ip');

    const proxyRequest = new Request(targetUrl, {
      method: request.method,
      headers: requestHeaders,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
      redirect: 'follow',
    });

    try {
      const response = await fetch(proxyRequest);

      const responseHeaders = new Headers(response.headers);
      responseHeaders.set('access-control-allow-origin', '*');
      responseHeaders.set('access-control-allow-methods', 'GET, POST, OPTIONS');
      responseHeaders.set('access-control-allow-headers', 'Content-Type, Authorization');
      responseHeaders.set('access-control-allow-credentials', 'true');

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Proxy error', message: error.message }), {
        status: 502,
        headers: { 'content-type': 'application/json' },
      });
    }
  },
};