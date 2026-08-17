# CPCJS

**[Play CPCJS online](https://smichea.github.io/cpcjs/)**

CPCJS is a browser port of [Caprice32](https://github.com/ColinPitrat/caprice32).
The original C++ core is compiled to WebAssembly and JavaScript with Emscripten;
SDL2 connects video, audio, keyboard, and controller support to browser APIs.

Supported formats: DSK, SNA, CDT, VOC, CPR, IPF, RAW, and ZIP.

## Requirements

- Emscripten (`em++` available in `PATH`)
- Node.js 18 or later
- the Caprice32 sources in `../caprice32`, or their location provided through
  `CAPRICE32_DIR`

On Ubuntu or Debian, Emscripten can be installed with:

```sh
sudo apt install emscripten
```

## Build and run

```sh
npm run build
npm run serve
```

Open <http://localhost:8080>, select a game image, and click the screen to give
the emulator keyboard focus. Audio starts after this user interaction, as
required by browser autoplay policies.

The build creates `public/emulator/caprice32.js`, `caprice32.wasm`, and the
preloaded data package. These artifacts are not committed. The application must
be served over HTTP; opening `index.html` directly through `file://` does not
work.

## Controls

- CPC keyboard: physical keyboard
- joystick: arrow keys, `Z`, and `X`
- Caprice32 menu: `F1`
- fullscreen: interface button or `Ctrl` + `Enter`

To change disks after startup, use the Caprice32 menu (`F1`). To start directly
with another image, reload the page.

## Local games and hosted catalog

The **Choose a game** button offers two sources:

- a CPC image stored on the user's device;
- a game from the catalog hosted in `public/games/`.

Hosted games use lowercase `game-name.<format>` filenames, a stable identifier,
a SHA-256 digest, and a link to the redistribution permission in
`public/games/catalog.json`. The browser verifies the file digest before
launching it.

The catalog currently contains five Design Design Software games distributed
with permission from Simon Brattel and the seven CPC games from the Vortex
Emulation Package. The Vortex package remains hosted as its unmodified original
archive; the browser extracts only the selected game in memory. Another game
must not be added unless its rights holder explicitly permits
**redistribution**. An “abandonware” label, a free download, or a page that
allows online play is not sufficient. Provenance, terms, and the catalog schema
are documented in `public/games/README.md`.

## Tests

Install Chromium for Playwright once, then run the suite:

```sh
npm install
npx playwright install chromium
npm test
```

`npm test` rebuilds the WebAssembly module and validates these flows in a real
headless Chromium instance:

- booting the CPC 6128 without an image, with active video and frame progress;
- loading the test disk image, entering `RUN"HELLO`, and running the BASIC
  program until the screen changes and the emulated printer port outputs the
  exact text `Hello, World !`;
- downloading and starting a standalone game from the hosted catalog;
- extracting and starting a Vortex game in memory from the original archive;
- selecting the interface language from the browser locale and persisting a
  manual language change.

The fixture comes from Caprice32's GPL-2.0 integration tests. These scenarios
validate the browser pipeline end to end; they do not imply compatibility with
the entire CPC software catalog.

## Manual deployment to GitHub Pages

For the initial setup, open **Settings → Pages → Build and deployment** in the
GitHub repository and select **GitHub Actions** as the source.

For each deployment:

1. open the repository's **Actions** tab;
2. select the **Deploy to GitHub Pages** workflow;
3. click **Run workflow**, select the branch to publish, and confirm with
   **Run workflow**.

The workflow rebuilds Caprice32 as WebAssembly, publishes the contents of
`public/`, and reports the site URL in the `deploy` job. It only runs when
manually triggered and does not deploy automatically after a push.

## License

Caprice32 and this port are distributed under GPL-2.0. The ROMs included in the
Caprice32 repository are packaged during the build. Third-party games in
`public/games/` retain their copyright and are not covered by the GPL; their
terms are documented in that directory.
