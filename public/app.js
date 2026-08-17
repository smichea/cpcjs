import { safeName } from './filename.js';
import { sha256Hex, validateCatalog } from './catalog.js';
import { extractZipMember } from './archive.js';
import { initI18n, t } from './i18n.js';

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
const languageSelect = document.querySelector('#language-select');

initI18n(languageSelect);

let started = false;
let hostedGames = [];
let statusDescriptor = { key: 'status.loading', state: '', values: {} };
let catalogDescriptor = { key: 'catalog.loading', values: {} };
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

function setStatus(key, state = '', values = {}) {
  statusDescriptor = { key, state, values };
  status.textContent = t(key, values);
  status.dataset.state = state;
}

function setRawStatus(message) {
  statusDescriptor = null;
  status.textContent = message;
}

function setCatalogMessage(key, values = {}) {
  catalogDescriptor = { key, values };
  catalogMessage.textContent = t(key, values);
}

window.addEventListener('cpcjs:languagechange', () => {
  if (statusDescriptor) {
    const { key, state, values } = statusDescriptor;
    setStatus(key, state, values);
  }
  if (catalogDescriptor) setCatalogMessage(catalogDescriptor.key, catalogDescriptor.values);
});

window.Module = {
  noInitialRun: true,
  canvas,
  locateFile: (path) => `emulator/${path}`,
  print: log,
  printErr: (message) => log(`[${t('log.errorPrefix')}] ${message}`),
  setStatus: (message) => message && setRawStatus(message),
  onRuntimeInitialized() {
    window.cpcjsState.runtimeReady = true;
    setStatus('status.ready', 'ready');
    runtimeReady();
  }
};

async function launch(file, source = 'local') {
  if (started) {
    setStatus('status.reload', 'warning');
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
    log(t('log.imageLoaded', { name: file.name, size: file.size }));
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
  setStatus(file ? 'status.playing' : 'status.started', 'running', file ? { name: file.name } : {});
  canvas.focus();
  Module.callMain(args);
}

async function loadCatalog() {
  try {
    const response = await fetch('games/catalog.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    hostedGames = validateCatalog(await response.json());

    if (!hostedGames.length) {
      setCatalogMessage('catalog.empty');
      return;
    }

    for (const game of hostedGames) {
      const option = document.createElement('option');
      option.value = game.slug;
      option.textContent = `${game.title}${game.year ? ` (${game.year})` : ''}`;
      hostedGame.append(option);
    }
    setCatalogMessage('catalog.available');
    hostedControls.hidden = false;
  } catch (error) {
    console.error(error);
    setCatalogMessage('catalog.unavailable');
  }
}

async function downloadHostedGame() {
  const game = hostedGames.find(({ slug }) => slug === hostedGame.value);
  if (!game) return;

  launchHosted.disabled = true;
  setStatus('status.downloading', 'loading', { title: game.title });
  try {
    const response = await fetch(game.file);
    if (!response.ok) throw new Error(t('error.download', { status: response.status }));
    let buffer = await response.arrayBuffer();
    if (game.archive && await sha256Hex(buffer) !== game.archive.sha256) {
      throw new Error(t('error.archiveDigest', { title: game.title }));
    }
    if (game.archive) buffer = await extractZipMember(buffer, game.archive.member);
    if (await sha256Hex(buffer) !== game.sha256) {
      throw new Error(t('error.digest', { title: game.title }));
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
  const message = error.i18nKey
    ? t(error.i18nKey, error.i18nValues)
    : error.message || String(error);
  window.cpcjsState.error = message;
  log(error.stack ? error.stack.replace(error.message, message) : message);
  setStatus('status.failed', 'error');
}

const emulatorScript = document.createElement('script');
emulatorScript.src = 'emulator/caprice32.js';
emulatorScript.async = true;
emulatorScript.onerror = () => fatal(new Error(
  t('error.buildMissing')
));
document.body.append(emulatorScript);
loadCatalog();
