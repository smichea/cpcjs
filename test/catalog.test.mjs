import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { validateCatalog } from '../public/catalog.js';
import { extractZipMember } from '../public/archive.js';

const catalogUrl = new URL('../public/games/catalog.json', import.meta.url);

const validGame = {
  slug: 'test-game',
  title: 'Test Game',
  year: 1987,
  publisher: 'Test Publisher',
  format: 'dsk',
  file: 'games/test-game.dsk',
  sha256: 'a'.repeat(64),
  rights: {
    status: 'freeware',
    redistributionUrl: 'https://example.com/permission'
  }
};

test('accepts a normalized hosted game with redistribution evidence', () => {
  assert.deepEqual(validateCatalog({ version: 1, games: [validGame] }), [validGame]);
});

test('rejects a hosted game without redistribution evidence', () => {
  const game = { ...validGame, rights: undefined };
  assert.throws(
    () => validateCatalog({ version: 1, games: [game] }),
    /error\.catalogEntryInvalid/
  );
});

test('rejects a file that does not match its normalized slug and format', () => {
  const game = { ...validGame, file: 'games/Test Game.dsk' };
  assert.throws(
    () => validateCatalog({ version: 1, games: [game] }),
    /error\.catalogEntryInvalid/
  );
});

test('validates every hosted game and its SHA-256 digest', async () => {
  const catalog = JSON.parse(await readFile(catalogUrl, 'utf8'));
  const games = validateCatalog(catalog);
  assert.equal(games.length, 12);

  for (const game of games) {
    const fileUrl = new URL(`../public/${game.file}`, import.meta.url);
    let contents = await readFile(fileUrl);
    if (game.archive) {
      const archiveDigest = createHash('sha256').update(contents).digest('hex');
      assert.equal(archiveDigest, game.archive.sha256, `${game.title} archive`);
      contents = await extractZipMember(contents, game.archive.member);
    }
    const digest = createHash('sha256').update(contents).digest('hex');
    assert.equal(digest, game.sha256, game.title);
  }
});

test('rejects a missing member in the original Vortex archive', async () => {
  const archiveUrl = new URL('../public/games/vortex/VTX_CPC.ZIP', import.meta.url);
  await assert.rejects(
    extractZipMember(await readFile(archiveUrl), 'MISSING.SNA'),
    /error\.zipMemberMissing/
  );
});
