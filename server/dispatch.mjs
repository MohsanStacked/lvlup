import { serveBytes } from './api.mjs';

export function createSiteHandler({ assets, api }) {
  return async (request) => {
    const path = new URL(request.url).pathname.replace(/\/+$/, '') || '/';
    if (path.startsWith('/api/')) return api(request);
    if (!['GET', 'HEAD'].includes(request.method)) return new Response('Method not allowed', { status: 405 });

    const [type, content, status = 200] = assets[path] || assets['/404'];
    const bytes = Uint8Array.from(atob(content), (character) => character.charCodeAt(0));
    const response = serveBytes(request, bytes, type, type.startsWith('text/html') ? 'no-cache' : 'public, max-age=3600');
    if (!type.startsWith('text/html')) return response;

    const headers = new Headers(response.headers);
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; media-src 'self' https:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'; object-src 'none'");
    return new Response(response.body, { headers, status: status === 404 ? 404 : response.status });
  };
}
