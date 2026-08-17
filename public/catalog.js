import { appError } from './errors.js';

const FORMATS = new Set(['dsk', 'sna', 'cdt', 'voc', 'cpr', 'ipf', 'raw', 'zip']);
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SHA256_PATTERN = /^[a-f0-9]{64}$/;

export function validateCatalog(catalog) {
  if (catalog?.version !== 1 || !Array.isArray(catalog.games)) {
    throw appError('error.catalogInvalid');
  }

  const slugs = new Set();
  return catalog.games.map((game) => {
    const format = String(game?.format || '').toLowerCase();
    const expectedFile = `games/${game?.slug}.${format}`;
    const archive = game?.archive;
    const validArchive = archive
      && archive.type === 'zip'
      && SHA256_PATTERN.test(archive.sha256 || '')
      && typeof archive.member === 'string'
      && archive.member.toLowerCase().endsWith(`.${format}`)
      && /^games\/[a-zA-Z0-9/_-]+\.zip$/i.test(game?.file || '')
      && !game.file.includes('..');
    const validRights = game?.rights
      && typeof game.rights.status === 'string'
      && /^https:\/\//.test(game.rights.redistributionUrl || '');

    if (!SLUG_PATTERN.test(game?.slug || '')
      || slugs.has(game.slug)
      || typeof game?.title !== 'string'
      || !game.title.trim()
      || !FORMATS.has(format)
      || (archive ? !validArchive : game.file !== expectedFile)
      || !SHA256_PATTERN.test(game?.sha256 || '')
      || !validRights) {
      throw appError('error.catalogEntryInvalid', { slug: game?.slug || '?' });
    }

    slugs.add(game.slug);
    return { ...game, format };
  });
}

export async function sha256Hex(buffer) {
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}
