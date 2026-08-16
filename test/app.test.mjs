import test from 'node:test';
import assert from 'node:assert/strict';
import { safeName } from '../public/filename.js';

test('normalise a game filename for the virtual filesystem', () => {
  assert.equal(safeName('../../Prince of Persia.dsk'), '.._.._Prince_of_Persia.dsk');
  assert.equal(safeName('bombjack.zip'), 'bombjack.zip');
  assert.equal(safeName(''), 'game.dsk');
});
