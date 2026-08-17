import { safeName } from './filename.js';
import { sha256Hex, validateCatalog } from './catalog.js';
import { extractZipMember } from './archive.js';

const canvas = document.querySelector('#canvas');
const status = document.querySelector('#status');
const fileInput = document.querySelector('#game-file');
const chooseGame = document.querySelector('#choose-game');
const gamePicker = document.querySelector('#game-picker');
const catalogMessage = document.querySelector('#catalog-message');
const hostedControls = document.querySelector('#hosted-controls');
const hostedGame = document.querySelector('#hosted-game');
const launchHosted = document.querySelector('#launch-hosted');
const startEmpty = document.querySelector('#start-empty');
const fullscreen = document.querySelector('#fullscreen');
const screenMessage = document.querySelector('#screen-message');
const logs = document.querySelector('#logs');

let started = false;
let hostedGames = [];
let runtimeReady;
const ready = new Promise((resolve) => { runtimeReady = resolve; });

window.cpcjsState = {
  runtimeReady: false,
  started: false,
  mode: null,
  gameSource: null,
  gamePath: null,
  error: null
};

function log(message) {
  logs.textContent += `${message}\n`;
  logs.scrollTop = logs.scrollHeight;
}

function setStatus(message, state = '') {
  status.textContent = message;
  status.dataset.state = state;
}

window.Module = {
  noInitialRun: true,
  canvas,
  locateFile: (path) => `emulator/${path}`,
  print: log,
  printErr: (message) => log(`[erreur] ${message}`),
  setStatus: (message) => message && setStatus(message),
  onRuntimeInitialized() {
    window.cpcjsState.runtimeReady = true;
    setStatus('Prêt — choisissez un jeu', 'ready');
    runtimeReady();
  }
};

async function launch(file, source = 'local') {
  if (started) {
    setStatus('Rechargez la page pour changer de jeu', 'warning');
    return;
  }

  await ready;
  const args = ['-c', '/cap32.cfg'];
  if (file) {
    const path = `/games/${safeName(file.name)}`;
    Module.FS.mkdirTree('/games');
    Module.FS.writeFile(path, new Uint8Array(await file.arrayBuffer()));
    args.push(path);
    window.cpcjsState.gamePath = path;
    log(`Image chargée: ${file.name} (${file.size} octets)`);
  }

  started = true;
  window.cpcjsState.started = true;
  window.cpcjsState.mode = file ? 'game' : 'empty';
  window.cpcjsState.gameSource = file ? source : null;
  fileInput.disabled = true;
  chooseGame.disabled = true;
  launchHosted.disabled = true;
  startEmpty.disabled = true;
  fullscreen.disabled = false;
  screenMessage.hidden = true;
  setStatus(file ? `En jeu — ${file.name}` : 'CPC 6128 démarré', 'running');
  canvas.focus();
  Module.callMain(args);
}

async function loadCatalog() {
  try {
    const response = await fetch('games/catalog.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    hostedGames = validateCatalog(await response.json());

    if (!hostedGames.length) {
      catalogMessage.textContent = 'Aucun jeu redistribuable n’est encore référencé.';
      return;
    }

    for (const game of hostedGames) {
      const option = document.createElement('option');
      option.value = game.slug;
      option.textContent = `${game.title}${game.year ? ` (${game.year})` : ''}`;
      hostedGame.append(option);
    }
    catalogMessage.textContent = 'Ces fichiers sont publiés avec l’autorisation indiquée dans le catalogue.';
    hostedControls.hidden = false;
  } catch (error) {
    console.error(error);
    catalogMessage.textContent = 'Le catalogue hébergé est indisponible.';
  }
}

async function downloadHostedGame() {
  const game = hostedGames.find(({ slug }) => slug === hostedGame.value);
  if (!game) return;

  launchHosted.disabled = true;
  setStatus(`Téléchargement — ${game.title}`, 'loading');
  try {
    const response = await fetch(game.file);
    if (!response.ok) throw new Error(`Téléchargement impossible (HTTP ${response.status})`);
    let buffer = await response.arrayBuffer();
    if (game.archive && await sha256Hex(buffer) !== game.archive.sha256) {
      throw new Error(`Empreinte invalide pour l’archive de ${game.title}`);
    }
    if (game.archive) buffer = await extractZipMember(buffer, game.archive.member);
    if (await sha256Hex(buffer) !== game.sha256) {
      throw new Error(`Empreinte invalide pour ${game.title}`);
    }
    gamePicker.close();
    await launch(new File([buffer], `${game.slug}.${game.format}`), 'hosted');
  } catch (error) {
    launchHosted.disabled = false;
    throw error;
  }
}

chooseGame.addEventListener('click', () => gamePicker.showModal());
fileInput.addEventListener('change', () => {
  const [file] = fileInput.files;
  if (file) {
    gamePicker.close();
    launch(file).catch(fatal);
  }
});
launchHosted.addEventListener('click', () => downloadHostedGame().catch(fatal));
startEmpty.addEventListener('click', () => launch().catch(fatal));
fullscreen.addEventListener('click', () => canvas.requestFullscreen?.());
canvas.addEventListener('click', () => canvas.focus());

function fatal(error) {
  console.error(error);
  window.cpcjsState.error = error.message || String(error);
  log(error.stack || error.message || String(error));
  setStatus('Échec du démarrage — consultez le journal', 'error');
}

const emulatorScript = document.createElement('script');
emulatorScript.src = 'emulator/caprice32.js';
emulatorScript.async = true;
emulatorScript.onerror = () => fatal(new Error(
  'Build WebAssembly absent. Exécutez npm run build, puis relancez le serveur.'
));
document.body.append(emulatorScript);
loadCatalog();
