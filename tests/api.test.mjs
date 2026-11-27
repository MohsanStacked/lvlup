import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createLocalStore } from '../server/local-store.mjs';
import { createApi } from '../server/api.mjs';
import { validateEnquiry, validateMedia } from './load-domain.mjs';

const token = 'test-token';
const address = 'http://localhost';
const post = (path, body, auth = false, method = 'POST') => new Request(address + path, {
  method, body: JSON.stringify(body),
  headers: { 'Content-Type': 'application/json', ...(auth ? { Authorization: 'Bearer ' + token } : {}) },
});

test('enquiries validate, persist after reopening the store and require admin access to read', async (context) => {
  const root = await mkdtemp(join(tmpdir(), 'lvlup-enquiry-test-'));
  context.after(() => rm(root, { recursive: true, force: true }));
  const opts = { token, validateEnquiry, validateMedia, examples: [] };
  const api = createApi({ ...opts, store: createLocalStore(root) });
  const bad = await api(post('/api/enquiries', { kind: 'contact', email: 'missing-name@example.com' }));
  assert.equal(bad.status, 400);

  const saved = await api(post('/api/enquiries', { kind: 'contact', name: 'Sample Visitor', email: 'sample@example.com', topic: 'General enquiry', message: 'Test enquiry' }));
  assert.equal(saved.status, 201);
  const { reference } = await saved.json();
  assert.match(reference, /^LVL-/);
  const reopened = createApi({ ...opts, store: createLocalStore(root) });
  assert.equal((await reopened(new Request(address + '/api/studio/enquiries'))).status, 401);
  const list = await reopened(new Request(address + '/api/studio/enquiries', { headers: { Authorization: 'Bearer ' + token } }));
  const entries = await list.json();
  assert.equal(entries[0].reference, reference);
  assert.equal(entries[0].message, 'Test enquiry');
});

test('authenticated gallery records can be added, edited and removed', async (context) => {
  const root = await mkdtemp(join(tmpdir(), 'lvlup-gallery-test-'));
  context.after(() => rm(root, { recursive: true, force: true }));
  const api = createApi({ token, validateEnquiry, validateMedia, examples: [], store: createLocalStore(root) });
  const item = { kind: 'image', src: 'https://example.com/photo.jpg', instagram: 'https://www.instagram.com/p/Example/', category: 'Training', retreat: 'thailand', caption: 'Sample photo', featured: true };
  assert.equal((await api(post('/api/studio/media', item))).status, 401);
  const saved = await api(post('/api/studio/media', item, true));
  assert.equal(saved.status, 201);
  const { id } = await saved.json();
  const edited = await api(post('/api/studio/media/' + id, { ...item, caption: 'New caption' }, true, 'PUT'));
  assert.equal(edited.status, 200);
  const publicList = await api(new Request(address + '/api/media'));
  assert.equal((await publicList.json())[0].caption, 'New caption');
  const removed = await api(new Request(address + '/api/studio/media/' + id, { method: 'DELETE', headers: { Authorization: 'Bearer ' + token } }));
  assert.equal(removed.status, 200);
  assert.deepEqual(await (await api(new Request(address + '/api/media'))).json(), []);
});

test('media uploads validate the file format and support browser byte ranges', async (context) => {
  const root = await mkdtemp(join(tmpdir(), 'lvlup-file-test-'));
  context.after(() => rm(root, { recursive: true, force: true }));
  const api = createApi({ token, validateEnquiry, validateMedia, examples: [], store: createLocalStore(root) });
  const sample = await import('node:fs/promises').then(({ readFile }) => readFile(new URL('../public/media/training-preview.mp4', import.meta.url)));
  const upload = (body, contentType) => new Request(address + '/api/studio/upload', {
    method: 'POST', body, headers: { Authorization: 'Bearer ' + token, 'Content-Type': contentType },
  });
  assert.equal((await api(upload('not a movie', 'video/mp4'))).status, 415);
  const response = await api(upload(sample, 'video/mp4'));
  assert.equal(response.status, 201);
  const { src } = await response.json();
  const range = await api(new Request(address + src, { headers: { Range: 'bytes=4-7' } }));
  assert.equal(range.status, 206);
  assert.equal(range.headers.get('Content-Range'), 'bytes 4-7/' + sample.length);
  assert.equal(await range.text(), 'ftyp');
});
