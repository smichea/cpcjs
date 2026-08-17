# CPCJS

> [!WARNING]
> **Projet en construction.** Le port de l’émulateur est encore expérimental
> et n’est pas fonctionnel pour le moment. Il n’est pas encore possible de
> jouer correctement à des jeux CPC dans le navigateur.

CPCJS est le port navigateur de [Caprice32](https://github.com/ColinPitrat/caprice32).
Le cœur C++ original est compilé en WebAssembly et JavaScript avec Emscripten;
SDL2 relie l’écran, le son, le clavier et les manettes aux API du navigateur.

Formats acceptés: DSK, SNA, CDT, VOC, CPR, IPF, RAW et ZIP.

## Prérequis

- Emscripten (`em++` dans le `PATH`)
- Node.js 18 ou supérieur
- les sources Caprice32 dans `../caprice32`, ou leur chemin dans
  `CAPRICE32_DIR`

Sur Ubuntu/Debian, Emscripten peut être installé avec:

```sh
sudo apt install emscripten
```

## Construire et jouer

```sh
npm run build
npm run serve
```

Ouvrir ensuite <http://localhost:8080>, choisir une image de jeu, puis cliquer
dans l’écran pour donner le focus au clavier. Le son démarre après cette action
utilisateur, conformément aux règles des navigateurs.

Le build produit `public/emulator/caprice32.js`, `caprice32.wasm` et le paquet de
données préchargé. Ces artefacts ne sont pas versionnés. Le navigateur doit être
servi via HTTP; ouvrir directement `index.html` avec `file://` ne fonctionne pas.

## Contrôles

- clavier CPC: clavier physique
- joystick: flèches, `Z` et `X`
- menu Caprice32: `F1`
- plein écran: bouton de l’interface ou `Ctrl` + `Entrée`

Pour changer de disque après le démarrage, utilisez le menu Caprice32 (`F1`).
Pour démarrer directement avec une autre image, rechargez la page.

## Tests

Installer Chromium pour Playwright une première fois, puis lancer la suite:

```sh
npm install
npx playwright install chromium
npm test
```

`npm test` reconstruit le module WebAssembly, puis valide dans un vrai Chromium
headless les deux parcours suivants:

- démarrage du CPC 6128 sans image, affichage vidéo et progression des frames;
- chargement de l’image disque de test, saisie de `RUN"HELLO` et exécution du
  programme BASIC jusqu’à la modification effective de l’écran et la sortie
  exacte `Hello, World !` sur le port imprimante émulé.

La fixture est issue des tests intégrés GPL-2.0 de Caprice32. Ces scénarios
valident le pipeline navigateur de bout en bout; ils ne signifient pas encore
que l’ensemble du catalogue de jeux CPC est compatible.

## Licence

Caprice32 et ce port sont distribués sous GPL-2.0. Les ROM incluses dans le
dépôt Caprice32 sont empaquetées au moment du build.
