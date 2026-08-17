import { safeName } from './filename.js';

const canvas = document.querySelector('#canvas');
const status = document.querySelector('#status');
const fileInput = document.querySelector('#game-file');
const startEmpty = document.querySelector('#start-empty');
const fullscreen = document.querySelector('#fullscreen');
const screenMessage = document.querySelector('#screen-message');
const logs = document.querySelector('#logs');

let started = false;
let runtimeReady;
const ready = new Promise((resolve) => { runtimeReady = resolve; });

window.cpcjsState = {
  runtimeReady: false,
  started: false,
  mode: null,
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

async function launch(file) {
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
  fileInput.disabled = true;
  startEmpty.disabled = true;
  fullscreen.disabled = false;
  screenMessage.hidden = true;
  setStatus(file ? `En jeu — ${file.name}` : 'CPC 6128 démarré', 'running');
  canvas.focus();
  Module.callMain(args);
}

fileInput.addEventListener('change', () => {
  const [file] = fileInput.files;
  if (file) launch(file).catch(fatal);
});
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
