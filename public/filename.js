export function safeName(name) {
  const cleaned = name.replace(/[^a-zA-Z0-9._-]/g, '_');
  return cleaned || 'game.dsk';
}
