# Hosted game catalog

This directory must only contain games whose rights holders explicitly permit
redistribution.

## Included games

The following five Design Design Software snapshots are included: **Bat &
Ball**, **Dark Star**, **Forbidden Planet**, **Halls of the Things '85**, and
**Tank Busters**. Their author, Simon Brattel, donated them for unmodified,
free-of-charge distribution. The original notice is preserved in
`DESIGN-DESIGN-NOTICE.txt`.

Original source: `https://www.genesis8bit.fr/frontend/gamecal/desdes.zip`
(archive SHA-256: `5ee39138a2b451711eeb65fedf1a636bad079dc039e55ced44c77a7862cd9a47`).

The snapshots were only renamed to follow the repository convention; their
bytes are unchanged and their digests are recorded in `catalog.json`. These
games remain the property of their respective rights holders and are not
covered by CPCJS's GPL-2.0 license.

The seven CPC games from the **Vortex Emulation Package** are also available:
**Alien Highway**, **Android One**, **Deflektor**, **H.A.T.E.**, **Highway
Encounter**, **Revolution**, and **Tornado Low Level**. In accordance with the
Vortex notice, they remain grouped in the unmodified original
`vortex/VTX_CPC.ZIP` archive, which also contains `VORTEX.TXT`. The client only
extracts the selected snapshot in memory when launching it.

Original source: `https://www.genesis8bit.fr/frontend/gamecal/vtx_cpc.zip`
(SHA-256: `7e8a9859408942b9e59979b6625c38fd2e5620aaabeaa55573d14187f4a070b9`).
Vortex Software retains all copyrights; distribution must remain free of
charge, and the archive and its notice must not be altered.

## Convention

- use a lowercase ASCII identifier and filename in `game-name` form;
- store one playable file per entry as `game-name.<format>`;
- when redistribution terms require an original archive, multiple entries may
  reference that archive and identify their member through the `archive` field;
- supported formats are `dsk`, `sna`, `cdt`, `voc`, `cpr`, `ipf`, `raw`, and
  `zip`;
- a SHA-256 digest is required;
- an HTTPS link to the redistribution permission is required.

Example `catalog.json` entry:

```json
{
  "slug": "game-name",
  "title": "Game Name",
  "year": 1987,
  "publisher": "Publisher",
  "format": "dsk",
  "file": "games/game-name.dsk",
  "sha256": "64-character hexadecimal SHA-256 digest",
  "rights": {
    "status": "freeware",
    "redistributionUrl": "https://source.example/permission"
  }
}
```

An “abandonware” label, availability on a download site, or permission to play
a game online does not by itself grant permission to republish the file in this
repository.
