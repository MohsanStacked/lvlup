const TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'video/mp4': 'mp4', 'video/webm': 'webm' };
const json = (value, status = 200) => Response.json(value, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
const error = (message, status) => json({ error: message }, status);
const encoder = new TextEncoder();

async function isAuthorised(request, token) {
  const auth = request.headers.get('Authorization') || '';
  if (!token || !auth.startsWith('Bearer ') || auth.length > 1024) return false;
  const digests = await Promise.all([auth.slice(7), token].map(async (value) => new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(value)))));
  return digests[0].reduce((mismatch, byte, index) => mismatch | (byte ^ digests[1][index]), 0) === 0;
}

async function limitedBody(request, maxSize) {
  if (!request.body || Number(request.headers.get('Content-Length')) > maxSize) return null;
  const reader = request.body.getReader();
  const chunks = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > maxSize) {
      await reader.cancel().catch(() => {});
      return null;
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let cursor = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, cursor);
    cursor += chunk.length;
  }
  return bytes;
}

async function readJson(request) {
  if (request.headers.get('Content-Type')?.split(';')[0] !== 'application/json') return null;
  const body = await limitedBody(request, 16 * 1024);
  try {
    return body ? JSON.parse(new TextDecoder().decode(body)) : null;
  } catch {
    return null;
  }
}

export function serveBytes(request, bytes, type, cacheControl = 'public, max-age=3600') {
  const headers = new Headers({ 'Content-Type': type, 'Cache-Control': cacheControl, 'X-Content-Type-Options': 'nosniff', 'Accept-Ranges': 'bytes' });
  const range = request.headers.get('Range');
  if (!range) {
    headers.set('Content-Length', String(bytes.length));
    return new Response(request.method === 'HEAD' ? null : bytes, { headers });
  }
  const match = /^bytes=(\d*)-(\d*)$/.exec(range);
  const start = match?.[1] ? Number(match[1]) : Math.max(0, bytes.length - Number(match?.[2]));
  const end = match?.[1] && match[2] ? Math.min(Number(match[2]), bytes.length - 1) : bytes.length - 1;
  if (!match || !Number.isSafeInteger(start) || start > end || start >= bytes.length) {
    headers.set('Content-Range', 'bytes */' + bytes.length);
    return new Response(null, { status: 416, headers });
  }
  headers.set('Content-Range', 'bytes ' + start + '-' + end + '/' + bytes.length);
  headers.set('Content-Length', String(end - start + 1));
  return new Response(request.method === 'HEAD' ? null : bytes.subarray(start, end + 1), { status: 206, headers });
}

function validFile(bytes, type) {
  const ascii = (first, last) => new TextDecoder().decode(bytes.subarray(first, last));
  switch (type) {
    case 'image/jpeg': return bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
    case 'image/png': return bytes[0] === 137 && ascii(1, 4) === 'PNG';
    case 'image/webp': return ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP';
    case 'video/mp4': return ascii(4, 8) === 'ftyp';
    case 'video/webm': return bytes[0] === 26 && bytes[1] === 69 && bytes[2] === 223 && bytes[3] === 163;
    default: return false;
  }
}

export function createApi({ store, token, validateEnquiry, validateMedia, examples }) {
  return async (request) => {
    const url = new URL(request.url);
    const path = url.pathname;
    try {
      if (path === '/api/enquiries' && request.method === 'POST') {
        const raw = await readJson(request);
        const value = validateEnquiry(raw);
        if (!value || raw.website) return error('Check the required fields and try again.', 400);
        const reference = 'LVL-' + crypto.randomUUID().replaceAll('-', '').slice(0, 12).toUpperCase();
        await store.saveEnquiry({ ...value, reference, receivedAt: new Date().toISOString() });
        return json({ reference }, 201);
      }
      if (path === '/api/media' && request.method === 'GET') {
        const items = await store.listMedia();
        return json(items.length ? items : examples);
      }
      const file = /^\/api\/media\/files\/([\w-]+\.\w+)$/.exec(path);
      if (file && ['GET', 'HEAD'].includes(request.method)) {
        const object = await store.getFile(file[1]);
        return object ? serveBytes(request, object.bytes, object.type, 'public, max-age=86400') : error('Media not found.', 404);
      }
      if (!path.startsWith('/api/studio/')) return error('Not found.', 404);
      if (!await isAuthorised(request, token)) return error('Enter the studio access token.', 401);

      if (path === '/api/studio/enquiries' && request.method === 'GET') return json(await store.listEnquiries());
      if (path === '/api/studio/media' && request.method === 'GET') return json(await store.listMedia());
      if (path === '/api/studio/media' && request.method === 'POST') {
        const item = validateMedia(await readJson(request));
        if (!item) return error('Check the caption, media source and Instagram link.', 400);
        const value = { ...item, id: crypto.randomUUID() };
        await store.saveMedia(value);
        return json(value, 201);
      }
      const edit = /^\/api\/studio\/media\/([\w-]+)$/.exec(path);
      if (edit && ['PUT', 'DELETE'].includes(request.method)) {
        if (!(await store.listMedia()).some((item) => item.id === edit[1])) return error('Media not found.', 404);
        if (request.method === 'DELETE') {
          await store.removeMedia(edit[1]);
          return json({ removed: true });
        }
        const item = validateMedia(await readJson(request));
        if (!item) return error('Check the caption, media source and Instagram link.', 400);
        const value = { ...item, id: edit[1] };
        await store.saveMedia(value);
        return json(value);
      }
      if (path === '/api/studio/upload' && request.method === 'POST') {
        const type = request.headers.get('Content-Type');
        if (!type || !Object.hasOwn(TYPES, type)) return error('Upload a JPG, PNG, WebP, MP4 or WebM file.', 415);
        const bytes = await limitedBody(request, 12 * 1024 * 1024);
        if (!bytes?.length) return error('Select a file of 12 MB or less.', 413);
        if (!validFile(bytes, type)) return error('The file does not match its media format.', 415);
        const name = crypto.randomUUID() + '.' + TYPES[type];
        await store.saveFile(name, bytes, type);
        return json({ src: '/api/media/files/' + name }, 201);
      }
      return error('Not found.', 404);
    } catch {
      return error('Temporarily unavailable. Please try again.', 503);
    }
  };
}
