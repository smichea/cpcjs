const END_OF_CENTRAL_DIRECTORY = 0x06054b50;
const CENTRAL_DIRECTORY_ENTRY = 0x02014b50;
const LOCAL_FILE_HEADER = 0x04034b50;
const MAX_MEMBER_SIZE = 16 * 1024 * 1024;

function findEndOfCentralDirectory(view) {
  const minimumOffset = Math.max(0, view.byteLength - 65_557);
  for (let offset = view.byteLength - 22; offset >= minimumOffset; offset -= 1) {
    if (view.getUint32(offset, true) === END_OF_CENTRAL_DIRECTORY) return offset;
  }
  throw new Error('Archive ZIP invalide: répertoire central absent');
}

function assertRange(offset, length, total) {
  if (offset < 0 || length < 0 || offset + length > total) {
    throw new Error('Archive ZIP invalide: données tronquées');
  }
}

async function inflateRaw(bytes) {
  if (typeof DecompressionStream !== 'function') {
    throw new Error('Ce navigateur ne sait pas décompresser cette archive ZIP');
  }
  const stream = new Blob([bytes]).stream()
    .pipeThrough(new DecompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

export async function extractZipMember(input, memberName) {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const decoder = new TextDecoder();
  const endOffset = findEndOfCentralDirectory(view);
  const entryCount = view.getUint16(endOffset + 10, true);
  let offset = view.getUint32(endOffset + 16, true);

  for (let index = 0; index < entryCount; index += 1) {
    assertRange(offset, 46, view.byteLength);
    if (view.getUint32(offset, true) !== CENTRAL_DIRECTORY_ENTRY) {
      throw new Error('Archive ZIP invalide: entrée centrale incorrecte');
    }

    const flags = view.getUint16(offset + 8, true);
    const method = view.getUint16(offset + 10, true);
    const compressedSize = view.getUint32(offset + 20, true);
    const uncompressedSize = view.getUint32(offset + 24, true);
    const nameLength = view.getUint16(offset + 28, true);
    const extraLength = view.getUint16(offset + 30, true);
    const commentLength = view.getUint16(offset + 32, true);
    const localOffset = view.getUint32(offset + 42, true);
    assertRange(offset + 46, nameLength + extraLength + commentLength, view.byteLength);
    const name = decoder.decode(bytes.subarray(offset + 46, offset + 46 + nameLength));

    if (name === memberName) {
      if (flags & 1) throw new Error(`Membre ZIP chiffré non pris en charge: ${memberName}`);
      if (uncompressedSize > MAX_MEMBER_SIZE) throw new Error(`Membre ZIP trop volumineux: ${memberName}`);
      assertRange(localOffset, 30, view.byteLength);
      if (view.getUint32(localOffset, true) !== LOCAL_FILE_HEADER) {
        throw new Error('Archive ZIP invalide: en-tête local incorrect');
      }
      const localNameLength = view.getUint16(localOffset + 26, true);
      const localExtraLength = view.getUint16(localOffset + 28, true);
      const dataOffset = localOffset + 30 + localNameLength + localExtraLength;
      assertRange(dataOffset, compressedSize, view.byteLength);
      const compressed = bytes.subarray(dataOffset, dataOffset + compressedSize);
      const extracted = method === 0
        ? compressed.slice()
        : method === 8
          ? await inflateRaw(compressed)
          : null;
      if (!extracted) throw new Error(`Compression ZIP non prise en charge: méthode ${method}`);
      if (extracted.byteLength !== uncompressedSize) {
        throw new Error(`Taille incorrecte après extraction de ${memberName}`);
      }
      return extracted;
    }

    offset += 46 + nameLength + extraLength + commentLength;
  }

  throw new Error(`Fichier absent de l’archive ZIP: ${memberName}`);
}
