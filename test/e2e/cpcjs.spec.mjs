import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const fixtureUrl = new URL('../fixtures/hello.zip.b64', import.meta.url);

async function waitForRuntime(page) {
  await page.goto('/');
  await expect(page.locator('#status')).toHaveAttribute('data-state', 'ready');
  await expect.poll(() => page.evaluate(() => window.cpcjsState.runtimeReady)).toBe(true);
}

async function waitForFrames(page, minimum) {
  await expect.poll(
    () => page.evaluate(() => window.Module?.cpcFrameCount || 0),
    { timeout: 30_000 }
  ).toBeGreaterThan(minimum);
}

async function typeOnCpcKeyboard(page, text) {
  for (const character of text) {
    const shifted = character === '"';
    const key = shifted ? "'" : character;
    let frame = await page.evaluate(() => window.Module.cpcFrameCount);
    if (shifted) await page.keyboard.down('Shift');
    await page.keyboard.down(key);
    await expect.poll(() => page.evaluate(() => window.Module.cpcFrameCount))
      .toBeGreaterThan(frame + 2);
    await page.keyboard.up(key);
    if (shifted) await page.keyboard.up('Shift');
    frame = await page.evaluate(() => window.Module.cpcFrameCount);
    await expect.poll(() => page.evaluate(() => window.Module.cpcFrameCount))
      .toBeGreaterThan(frame + 2);
  }
  let frame = await page.evaluate(() => window.Module.cpcFrameCount);
  await page.keyboard.down('Enter');
  await expect.poll(() => page.evaluate(() => window.Module.cpcFrameCount))
      .toBeGreaterThan(frame + 2);
  await page.keyboard.up('Enter');
  frame = await page.evaluate(() => window.Module.cpcFrameCount);
  await expect.poll(() => page.evaluate(() => window.Module.cpcFrameCount))
    .toBeGreaterThan(frame + 2);
}

async function expectHealthyRuntime(page, errors) {
  expect(errors, 'uncaught browser errors').toEqual([]);
  await expect.poll(() => page.evaluate(() => window.cpcjsState.error)).toBeNull();
  await expect(page.locator('#logs')).not.toContainText(/Aborted|exception|failed to (load|start|open)/i);
}

test('boots the CPC and keeps emulating without a game', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));

  await waitForRuntime(page);
  const placeholder = await page.locator('#canvas').screenshot();
  await page.locator('#start-empty').click();

  await expect(page.locator('#status')).toHaveText('CPC 6128 démarré');
  await expect.poll(() => page.evaluate(() => window.cpcjsState.mode)).toBe('empty');
  await waitForFrames(page, 30);

  const firstFrame = await page.evaluate(() => window.Module.cpcFrameCount);
  await expect.poll(() => page.evaluate(() => window.Module.cpcFrameCount)).toBeGreaterThan(firstFrame + 5);
  const cpcScreen = await page.locator('#canvas').screenshot();
  expect(cpcScreen.equals(placeholder), 'the CPC must replace the placeholder').toBe(false);
  await expectHealthyRuntime(page, errors);
});

test('loads a disk image and runs its program', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const fixture = Buffer.from((await readFile(fixtureUrl, 'utf8')).trim(), 'base64');

  await waitForRuntime(page);
  await page.locator('#choose-game').click();
  await expect(page.locator('#game-picker')).toBeVisible();
  await expect(page.locator('#catalog-message'))
    .toHaveText('Ces fichiers sont publiés avec l’autorisation indiquée dans le catalogue.');
  await expect(page.locator('#hosted-game option')).toHaveCount(12);
  await page.evaluate(() => {
    const config = window.Module.FS.readFile('/cap32.cfg', { encoding: 'utf8' });
    window.Module.FS.writeFile('/cap32.cfg', config.replace('printer=0', 'printer=1'));
  });
  await page.locator('#game-file').setInputFiles({
    name: 'hello.zip',
    mimeType: 'application/zip',
    buffer: fixture
  });

  await expect(page.locator('#status')).toHaveText('En jeu — hello.zip');
  await expect.poll(() => page.evaluate(() => window.cpcjsState.mode)).toBe('game');
  await expect.poll(() => page.evaluate(() => window.cpcjsState.gameSource)).toBe('local');
  await expect.poll(() => page.evaluate(() => window.cpcjsState.gamePath)).toBe('/games/hello.zip');
  await waitForFrames(page, 200);

  const readyScreen = await page.locator('#canvas').screenshot();
  await page.locator('#canvas').click();
  await typeOnCpcKeyboard(page, 'run"hello');
  const commandFrame = await page.evaluate(() => window.Module.cpcFrameCount);
  await expect.poll(() => page.evaluate(() => window.Module.cpcFrameCount)).toBeGreaterThan(commandFrame + 80);

  const programScreen = await page.locator('#canvas').screenshot();
  expect(programScreen.equals(readyScreen), 'RUN"HELLO must change the CPC display').toBe(false);
  await expect.poll(() => page.evaluate(() => {
    window.Module._fflush(0);
    try {
      return window.Module.FS.readFile('/printer.dat', { encoding: 'utf8' });
    } catch {
      return '';
    }
  })).toBe('Hello, World !\r\n');
  await expectHealthyRuntime(page, errors);
});

test('downloads and starts a hosted game from the catalog', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));

  await waitForRuntime(page);
  await page.locator('#choose-game').click();
  await page.locator('#hosted-game').selectOption('dark-star');
  await page.locator('#launch-hosted').click();

  await expect(page.locator('#game-picker')).not.toBeVisible();
  await expect(page.locator('#status')).toHaveText('En jeu — dark-star.sna');
  await expect.poll(() => page.evaluate(() => window.cpcjsState.mode)).toBe('game');
  await expect.poll(() => page.evaluate(() => window.cpcjsState.gameSource)).toBe('hosted');
  await expect.poll(() => page.evaluate(() => window.cpcjsState.gamePath))
    .toBe('/games/dark-star.sna');
  await waitForFrames(page, 30);
  await expectHealthyRuntime(page, errors);
});

test('extracts a Vortex game in memory from the original hosted archive', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));

  await waitForRuntime(page);
  await page.locator('#choose-game').click();
  await page.locator('#hosted-game').selectOption('alien-highway');
  await page.locator('#launch-hosted').click();

  await expect(page.locator('#status')).toHaveText('En jeu — alien-highway.sna');
  await expect.poll(() => page.evaluate(() => window.cpcjsState.gameSource)).toBe('hosted');
  await expect.poll(() => page.evaluate(() => window.cpcjsState.gamePath))
    .toBe('/games/alien-highway.sna');
  await waitForFrames(page, 30);
  await expectHealthyRuntime(page, errors);
});
