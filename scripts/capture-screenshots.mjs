import { spawn } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const webRoot = join(__dirname, '..');
const repoRoot = join(webRoot, '..');
const githubProfileAssetsDir = join(repoRoot, '.github', 'profile', 'assets');
const webAssetsDir = join(webRoot, 'assets');

mkdirSync(webAssetsDir, { recursive: true });
mkdirSync(githubProfileAssetsDir, { recursive: true });

function findBrowser() {
  if (process.env.CHROME_PATH && existsSync(process.env.CHROME_PATH)) {
    return process.env.CHROME_PATH;
  }

  const candidates = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    process.env.LOCALAPPDATA ? join(process.env.LOCALAPPDATA, 'Google\\Chrome\\Application\\chrome.exe') : null,
    process.env.LOCALAPPDATA ? join(process.env.LOCALAPPDATA, 'Microsoft\\Edge\\Application\\msedge.exe') : null,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
  ].filter(Boolean);

  for (const p of candidates) {
    if (existsSync(p)) return p;
  }

  throw new Error('No compatible Chromium browser found (Chrome or Edge).');
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class CdpClient {
  constructor(ws) {
    this.ws = ws;
    this.id = 1;
    this.callbacks = new Map();
    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.callbacks.has(msg.id)) {
        const { resolve, reject } = this.callbacks.get(msg.id);
        this.callbacks.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
}

async function findTargetUrl() {
  const ports = [3000, 3001];
  for (const port of ports) {
    try {
      const res = await fetch(`http://localhost:${port}`);
      if (res.ok) {
        return `http://localhost:${port}`;
      }
    } catch {}
  }
  return 'http://localhost:3000';
}

async function getPageWsUrl(port) {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/list`);
      if (res.ok) {
        const targets = await res.json();
        const page = targets.find((t) => t.type === 'page');
        if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
      }
    } catch {}
    await wait(250);
  }
  throw new Error('Timeout waiting for browser page target');
}

async function captureScreen(cdp, baseUrl, theme, targetPath) {
  await cdp.send('Page.navigate', { url: baseUrl });
  await wait(1000);

  await cdp.send('Runtime.evaluate', {
    expression: `
      localStorage.setItem('tunido_user', JSON.stringify({
        id: 'usr-student-1',
        email: 'camilavalenzuela@uchile.cl',
        firstName: 'Camila',
        lastName: 'Valenzuela',
        role: 'STUDENT',
        universityName: 'Universidad de Chile',
        isForeignStudent: true,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
      }));
      localStorage.setItem('tunido_token', 'demo-token');
      localStorage.setItem('tunido_favs', JSON.stringify(['pen-1', 'pen-2', 'pen-3', 'pen-4']));
      localStorage.setItem('tunido_theme', '${theme}');
      location.reload();
    `,
  });

  await wait(1500);

  await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `
      (async () => {
        const style = document.createElement('style');
        style.innerHTML = 'nextjs-portal, #__next-build-watcher, [data-nextjs-toast] { display: none !important; }';
        document.head.appendChild(style);

        for (let i = 0; i < 50; i++) {
          const santiagoBtn = Array.from(document.querySelectorAll('button')).find(
            (b) => b.textContent?.includes('Santiago') && b.textContent?.includes('pensiones')
          );
          if (santiagoBtn) {
            santiagoBtn.click();
          } else {
            const mapTab = document.querySelector('#nav-tab-map');
            if (mapTab) mapTab.click();
          }

          await new Promise((r) => setTimeout(r, 400));
          if (document.querySelector('.leaflet-container')) {
            break;
          }
        }

        for (let i = 0; i < 30; i++) {
          const verListaBtn = Array.from(document.querySelectorAll('button')).find((b) =>
            b.textContent?.includes('Ver lista')
          );
          if (verListaBtn) {
            verListaBtn.click();
          }

          const isOpened = Array.from(document.querySelectorAll('button')).some((b) =>
            b.textContent?.includes('Minimizar')
          );
          if (isOpened) {
            break;
          }

          await new Promise((r) => setTimeout(r, 400));
        }

        for (let i = 0; i < 20; i++) {
          const targetPin = Array.from(document.querySelectorAll('.leaflet-marker-icon')).find(
            (el) => el.textContent?.includes('279.600')
          );
          if (targetPin) {
            targetPin.click();
            break;
          }
          await new Promise((r) => setTimeout(r, 300));
        }
      })()
    `,
  });

  await wait(3500);

  const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' });
  const buffer = Buffer.from(data, 'base64');
  writeFileSync(targetPath, buffer);
}

async function main() {
  const browserPath = findBrowser();
  const baseUrl = await findTargetUrl();
  const debugPort = 9224;
  const tempProfile = join(os.tmpdir(), `tunido_shot_${Date.now()}`);
  mkdirSync(tempProfile, { recursive: true });

  const browserProc = spawn(browserPath, [
    '--headless=new',
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${tempProfile}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    'about:blank',
  ]);

  try {
    const wsUrl = await getPageWsUrl(debugPort);
    const ws = new WebSocket(wsUrl);
    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    const cdp = new CdpClient(ws);
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      mobile: true,
    });

    const darkPath = join(webAssetsDir, 'map-dark.png');
    const lightPath = join(webAssetsDir, 'map-light.png');

    console.log(`Capturing Dark Mode to ${darkPath}...`);
    await captureScreen(cdp, baseUrl, 'dark', darkPath);

    console.log(`Capturing Light Mode to ${lightPath}...`);
    await captureScreen(cdp, baseUrl, 'light', lightPath);

    copyFileSync(darkPath, join(githubProfileAssetsDir, 'map-dark.png'));
    copyFileSync(lightPath, join(githubProfileAssetsDir, 'map-light.png'));

    console.log('Screenshots captured successfully and synchronized with .github/profile/assets!');
  } finally {
    browserProc.kill();
    try {
      rmSync(tempProfile, { recursive: true, force: true });
    } catch {}
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
