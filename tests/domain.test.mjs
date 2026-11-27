import assert from 'node:assert/strict';
import test from 'node:test';
import { retreatMatches, validateEnquiry, isMediaSource } from './load-domain.mjs';
const retreat = { country: 'Thailand', focus: 'Boxing', dates: null, status: 'example' };
const booking = { kind: 'booking', name: 'Sample Person', email: 'sample@example.com', phone: '+44 7700 900123', retreat: 'thailand', experience: 'Beginner', message: '' };

test('combines filters and keeps undated examples out of dated searches', () => {
  assert.equal(retreatMatches(retreat, { destination: 'Thailand', focus: 'Boxing', year: '' }), true);
  assert.equal(retreatMatches(retreat, { destination: 'Spain', focus: 'Boxing', year: '' }), false);
  assert.equal(retreatMatches(retreat, { destination: '', focus: '', year: '2027' }), false);
  assert.equal(retreatMatches({ ...retreat, status: 'confirmed', dates: { start: '2027-05-01', end: '2027-05-07' } }, { destination: '', focus: '', year: '2027' }), true);
});

test('validates a booking enquiry and its required fields', () => {
  assert.deepEqual(validateEnquiry(booking), booking);
  assert.equal(validateEnquiry({ ...booking, email: 'not-an-email' }), null);
  assert.equal(validateEnquiry({ ...booking, phone: '' }), null);
  assert.equal(validateEnquiry({ ...booking, retreat: 'unknown' }), null);
  assert.equal(validateEnquiry({ ...booking, experience: 'Unknown' }), null);
});

test('only accepts HTTPS and controlled local media sources', () => {
  assert.equal(isMediaSource('https://example.com/clip.mp4'), true);
  assert.equal(isMediaSource('/media/training.webp'), true);
  assert.equal(isMediaSource('/media/../admin'), false);
  assert.equal(isMediaSource('//example.com/a.jpg'), false);
  assert.equal(isMediaSource('javascript:alert(1)'), false);
});
