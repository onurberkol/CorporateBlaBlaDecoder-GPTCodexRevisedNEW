import assert from 'node:assert/strict';
import test from 'node:test';
import { buildComposerSystemPrompt, buildDecoderSystemPrompt, isValidPayload, TONE_ORDER } from '../src/index';

test('decoder prompt always reserves the strict-schema defense field', () => {
  const free = buildDecoderSystemPrompt('tr', false);
  const premium = buildDecoderSystemPrompt('en', true);
  assert.match(free, /Set "defense" to an empty string/);
  assert.match(premium, /"defense" is a brief, professional reply/);
});

test('composer prompt emits every product tone', () => {
  const prompt = buildComposerSystemPrompt('en');
  for (const tone of TONE_ORDER) assert.match(prompt, new RegExp(`"${tone}"`));
});

test('daily plaza payload guard rejects malformed content', () => {
  assert.equal(isValidPayload('trap', { incoming: 'FYI', reading: 'Read this now.', meter: 50 }), true);
  assert.equal(isValidPayload('trap', { incoming: 'FYI', reading: 'Read this now.', meter: 101 }), false);
  assert.equal(isValidPayload('bingo', { cells: Array.from({ length: 9 }, (_, index) => String(index)) }), true);
  assert.equal(isValidPayload('bingo', { cells: ['only one'] }), false);
});
