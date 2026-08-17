import test from 'node:test';
import assert from 'node:assert/strict';
import { detectLanguage, formatMessage } from '../public/i18n.js';

test('detects French and English browser locales', () => {
  assert.equal(detectLanguage(['fr-FR', 'en-US']), 'fr');
  assert.equal(detectLanguage(['en-GB', 'fr-FR']), 'en');
});

test('falls back to English for unsupported browser locales', () => {
  assert.equal(detectLanguage(['de-DE', 'es-ES']), 'en');
});

test('formats translated messages with values', () => {
  assert.equal(formatMessage('en', 'status.playing', { name: 'game.sna' }), 'Playing — game.sna');
  assert.equal(formatMessage('fr', 'status.playing', { name: 'jeu.sna' }), 'En jeu — jeu.sna');
});
