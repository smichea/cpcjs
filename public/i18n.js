const STORAGE_KEY = 'cpcjs-language';
const SUPPORTED_LANGUAGES = new Set(['en', 'fr']);

const messages = {
  en: {
    'page.title': 'CPCJS — Caprice32 in your browser',
    'repo.link': 'View the code on GitHub',
    'language.label': 'Language',
    'status.loading': 'Loading the emulator…',
    'status.ready': 'Ready — choose a game',
    'status.reload': 'Reload the page to change games',
    'status.playing': 'Playing — {name}',
    'status.started': 'CPC 6128 started',
    'status.downloading': 'Downloading — {title}',
    'status.failed': 'Startup failed — see the technical log',
    'machine.aria': 'Amstrad CPC emulator',
    'canvas.aria': 'Amstrad CPC screen',
    'screen.choose': 'Choose a CPC game',
    'screen.formats': 'DSK, SNA, CDT, VOC, CPR, IPF, RAW, or ZIP',
    'controls.choose': 'Choose a game',
    'controls.empty': 'Start without a game',
    'controls.fullscreen': 'Fullscreen',
    'picker.eyebrow': 'CPC LIBRARY',
    'picker.title': 'Choose a game',
    'picker.close': 'Close',
    'local.title': 'From this device',
    'local.description': 'Open a CPC image stored on your computer.',
    'local.browse': 'Browse files',
    'hosted.title': 'Hosted games',
    'hosted.game': 'Game',
    'hosted.play': 'Play',
    'catalog.loading': 'Loading the catalog…',
    'catalog.empty': 'No redistributable game is listed yet.',
    'catalog.available': 'These files are published under the permission recorded in the catalog.',
    'catalog.unavailable': 'The hosted catalog is unavailable.',
    'help.joystick': 'Joystick',
    'help.fire': 'Fire 1 / 2',
    'help.menu': 'Caprice32 menu',
    'help.enter': 'Enter',
    'help.fullscreen': 'Fullscreen',
    'logs.summary': 'Technical log',
    'log.errorPrefix': 'error',
    'log.imageLoaded': 'Image loaded: {name} ({size} bytes)',
    'error.download': 'Download failed (HTTP {status})',
    'error.archiveDigest': 'Invalid archive digest for {title}',
    'error.digest': 'Invalid digest for {title}',
    'error.buildMissing': 'WebAssembly build missing. Run npm run build, then restart the server.',
    'error.zipDirectoryMissing': 'Invalid ZIP archive: central directory not found',
    'error.zipTruncated': 'Invalid ZIP archive: truncated data',
    'error.zipUnsupportedBrowser': 'This browser cannot decompress this ZIP archive',
    'error.zipCentralEntry': 'Invalid ZIP archive: incorrect central directory entry',
    'error.zipEncrypted': 'Encrypted ZIP member not supported: {member}',
    'error.zipTooLarge': 'ZIP member is too large: {member}',
    'error.zipLocalHeader': 'Invalid ZIP archive: incorrect local header',
    'error.zipCompression': 'Unsupported ZIP compression method: {method}',
    'error.zipSize': 'Incorrect size after extracting {member}',
    'error.zipMemberMissing': 'File not found in ZIP archive: {member}',
    'error.catalogInvalid': 'Invalid game catalog',
    'error.catalogEntryInvalid': 'Invalid game catalog entry: {slug}'
  },
  fr: {
    'page.title': 'CPCJS — Caprice32 dans le navigateur',
    'repo.link': 'Voir le code sur GitHub',
    'language.label': 'Langue',
    'status.loading': 'Chargement de l’émulateur…',
    'status.ready': 'Prêt — choisissez un jeu',
    'status.reload': 'Rechargez la page pour changer de jeu',
    'status.playing': 'En jeu — {name}',
    'status.started': 'CPC 6128 démarré',
    'status.downloading': 'Téléchargement — {title}',
    'status.failed': 'Échec du démarrage — consultez le journal technique',
    'machine.aria': 'Émulateur Amstrad CPC',
    'canvas.aria': 'Écran de l’Amstrad CPC',
    'screen.choose': 'Choisissez un jeu CPC',
    'screen.formats': 'DSK, SNA, CDT, VOC, CPR, IPF, RAW ou ZIP',
    'controls.choose': 'Choisir un jeu',
    'controls.empty': 'Démarrer sans jeu',
    'controls.fullscreen': 'Plein écran',
    'picker.eyebrow': 'BIBLIOTHÈQUE CPC',
    'picker.title': 'Choisir un jeu',
    'picker.close': 'Fermer',
    'local.title': 'Depuis cet appareil',
    'local.description': 'Ouvrez une image CPC conservée sur votre ordinateur.',
    'local.browse': 'Parcourir les fichiers',
    'hosted.title': 'Jeux hébergés',
    'hosted.game': 'Jeu',
    'hosted.play': 'Jouer',
    'catalog.loading': 'Chargement du catalogue…',
    'catalog.empty': 'Aucun jeu redistribuable n’est encore référencé.',
    'catalog.available': 'Ces fichiers sont publiés avec l’autorisation indiquée dans le catalogue.',
    'catalog.unavailable': 'Le catalogue hébergé est indisponible.',
    'help.joystick': 'Joystick',
    'help.fire': 'Feu 1 / 2',
    'help.menu': 'Menu Caprice32',
    'help.enter': 'Entrée',
    'help.fullscreen': 'Plein écran',
    'logs.summary': 'Journal technique',
    'log.errorPrefix': 'erreur',
    'log.imageLoaded': 'Image chargée : {name} ({size} octets)',
    'error.download': 'Téléchargement impossible (HTTP {status})',
    'error.archiveDigest': 'Empreinte invalide pour l’archive de {title}',
    'error.digest': 'Empreinte invalide pour {title}',
    'error.buildMissing': 'Build WebAssembly absent. Exécutez npm run build, puis relancez le serveur.',
    'error.zipDirectoryMissing': 'Archive ZIP invalide : répertoire central absent',
    'error.zipTruncated': 'Archive ZIP invalide : données tronquées',
    'error.zipUnsupportedBrowser': 'Ce navigateur ne sait pas décompresser cette archive ZIP',
    'error.zipCentralEntry': 'Archive ZIP invalide : entrée centrale incorrecte',
    'error.zipEncrypted': 'Membre ZIP chiffré non pris en charge : {member}',
    'error.zipTooLarge': 'Membre ZIP trop volumineux : {member}',
    'error.zipLocalHeader': 'Archive ZIP invalide : en-tête local incorrect',
    'error.zipCompression': 'Méthode de compression ZIP non prise en charge : {method}',
    'error.zipSize': 'Taille incorrecte après extraction de {member}',
    'error.zipMemberMissing': 'Fichier absent de l’archive ZIP : {member}',
    'error.catalogInvalid': 'Catalogue de jeux invalide',
    'error.catalogEntryInvalid': 'Entrée de catalogue invalide : {slug}'
  }
};

let currentLanguage = 'en';

export function detectLanguage(languages = []) {
  for (const language of languages) {
    const base = String(language).toLowerCase().split('-')[0];
    if (SUPPORTED_LANGUAGES.has(base)) return base;
  }
  return 'en';
}

export function formatMessage(language, key, values = {}) {
  const template = messages[language]?.[key] ?? messages.en[key] ?? key;
  return template.replace(/\{(\w+)\}/g, (_, name) => String(values[name] ?? `{${name}}`));
}

export function t(key, values = {}) {
  return formatMessage(currentLanguage, key, values);
}

function applyTranslations(select) {
  document.documentElement.lang = currentLanguage;
  document.title = t('page.title');
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-aria-label]').forEach((element) => {
    element.setAttribute('aria-label', t(element.dataset.i18nAriaLabel));
  });
  select.value = currentLanguage;
}

function storedLanguage(storage) {
  try {
    const value = storage.getItem(STORAGE_KEY);
    return SUPPORTED_LANGUAGES.has(value) ? value : null;
  } catch {
    return null;
  }
}

function storeLanguage(storage, language) {
  try {
    storage.setItem(STORAGE_KEY, language);
  } catch {
    // The interface still switches when storage is unavailable.
  }
}

export function initI18n(select, { languages = navigator.languages, storage = localStorage } = {}) {
  currentLanguage = storedLanguage(storage) || detectLanguage(languages);
  applyTranslations(select);

  select.addEventListener('change', () => {
    if (!SUPPORTED_LANGUAGES.has(select.value)) return;
    currentLanguage = select.value;
    storeLanguage(storage, currentLanguage);
    applyTranslations(select);
    window.dispatchEvent(new CustomEvent('cpcjs:languagechange'));
  });

  return currentLanguage;
}
