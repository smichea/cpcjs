# Catalogue de jeux hébergés

Ce répertoire ne doit contenir que des jeux dont la redistribution est
explicitement autorisée par le titulaire des droits.

## Jeux inclus

Les cinq snapshots Design Design Software suivants sont inclus: **Bat & Ball**,
**Dark Star**, **Forbidden Planet**, **Halls of the Things '85** et
**Tank Busters**. Leur auteur Simon Brattel les a donnés pour distribution
gratuite et non modifiée. La notice originale est conservée dans
`DESIGN-DESIGN-NOTICE.txt`.

Source originale: `https://www.genesis8bit.fr/frontend/gamecal/desdes.zip`
(SHA-256 de l'archive: `5ee39138a2b451711eeb65fedf1a636bad079dc039e55ced44c77a7862cd9a47`).

Les snapshots ont seulement été renommés selon la convention du dépôt; leurs
octets sont inchangés et leurs empreintes figurent dans `catalog.json`. Ces jeux
restent la propriété de leurs titulaires et ne sont pas couverts par la licence
GPL-2.0 du code CPCJS.

Les sept jeux CPC du **Vortex Emulation Package** sont également proposés:
**Alien Highway**, **Android One**, **Deflektor**, **H.A.T.E.**,
**Highway Encounter**, **Revolution** et **Tornado Low Level**. Conformément à
la notice Vortex, ils restent groupés dans l'archive originale non modifiée
`vortex/VTX_CPC.ZIP`, qui contient aussi `VORTEX.TXT`. Le client extrait
uniquement le snapshot choisi en mémoire au moment du lancement.

Source originale: `https://www.genesis8bit.fr/frontend/gamecal/vtx_cpc.zip`
(SHA-256: `7e8a9859408942b9e59979b6625c38fd2e5620aaabeaa55573d14187f4a070b9`).
Vortex Software conserve tous les copyrights; la distribution doit rester
gratuite, l'archive et sa notice ne doivent pas être altérées.

## Convention

- identifiant et fichier en minuscules ASCII, au format `nom-du-jeu`;
- un seul fichier jouable par entrée, nommé `nom-du-jeu.<format>`;
- lorsqu'une autorisation exige une archive originale, plusieurs entrées peuvent
  référencer cette archive et indiquer leur membre dans le champ `archive`;
- formats acceptés: `dsk`, `sna`, `cdt`, `voc`, `cpr`, `ipf`, `raw`, `zip`;
- empreinte SHA-256 obligatoire;
- URL HTTPS obligatoire vers l'autorisation de redistribution.

Exemple d'entrée dans `catalog.json`:

```json
{
  "slug": "nom-du-jeu",
  "title": "Nom du jeu",
  "year": 1987,
  "publisher": "Éditeur",
  "format": "dsk",
  "file": "games/nom-du-jeu.dsk",
  "sha256": "empreinte SHA-256 en 64 caractères hexadécimaux",
  "rights": {
    "status": "freeware",
    "redistributionUrl": "https://source.example/autorisation"
  }
}
```

Une mention « abandonware », la présence sur un site de téléchargement ou une
autorisation de jouer en ligne ne constitue pas à elle seule une autorisation
de republier le fichier dans ce dépôt.
