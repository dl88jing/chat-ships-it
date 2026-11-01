/**
 * Record a simulated-user walkthrough of the live Chat Ships It demo.
 * Playwright Chromium + recordVideo + visible cursor overlay.
 */
import { chromium } from "playwright-core";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "assets", "screen");
const BASE = process.env.DEMO_URL || "https://chat-ships-it.vercel.app";
const VIEWPORT = { width: 1280, height: 720 };

fs.mkdirSync(OUT, { recursive: true });

const CURSOR_JS = `
(() => {
  if (window.__csiCursor) return;
  const c = document.createElement('div');
  c.id = '__csi_cursor';
  c.style.cssText = 'position:fixed;left:0;top:0;width:22px;height:22px;border-radius:50%;border:2px solid #fff;background:rgba(145,70,255,.85);box-shadow:0 0 0 3px rgba(145,70,255,.35),0 8px 20px rgba(0,0,0,.45);pointer-events:none;z-index:2147483647;transform:translate(-50%,-50%);transition:width .08s,height .08s,background .08s';';
  document.documentElement.appendChild(c);
  window.__csiCursor = c;
  window.__csiMove = (x,y) => { c.style.left=x+'px'; c.style.top=y+'px'; };
  window.__csiClickFlash = () => {
    c.style.width='16px'; c.style.height='16px'; c.style.background='rgba(16,185,129,.95)';
    setTimeout(()=>{ c.style.width='22px'; c.style.height='22px'; c.style.background='rgba(145,70,255,.85)'; }, 140);
  };
  window.addEventListener('mousemove', (e)=>window.__csiMove(e.clientX,e.clientY), true);
  window.addEventListener('mousedown', ()=>window.__csiClickFlash(), true);
})();
`;

async function withCursor(page) {
  await page.addInitScript(CURSOR_JS);
  await page.evaluate(CURSOR_JS).catch(() => {});
}

async function moveTo(page, locator, steps = 18) {
  const box = await locator.boundingBox();
  if (!box) throw new Error("no bounding box");
  const x = box.x + box.width / 2;
  const y = box.y + Math.min(box.height / 2, 14);
  await page.mouse.move(x, y, { steps });
  await page.evaluate(([cx, cy]) => window.__csiMove?.(cx, cy), [x, y]);
  await page.waitForTimeout(180);
  return { x, y };
}

async function clickLoc(page, locator) {
  await moveTo(page, locator);
  await page.evaluate(() => window.__csiClickFlash?.());
  await locator.click({ delay: 40 });
  await page.waitForTimeout(350);
}

async function typeSlow(page, locator, text) {
  await clickLoc(page, locator);
  await locator.fill("");
  for (const ch of text) {
    await page.keyboard.type(ch, { delay: 55 + Math.random() * 70 });
  }
  await page.waitForTimeout(250);
}

async function recordClip(name, run) {
  const videoDir = path.join(OUT, `_raw_${name}`);
  fs.rmSync(videoDir, { recursive: true, force: true });
  fs.mkdirSync(videoDir, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    args: ["--disable-dev-shm-usage", "--no-sandbox"],
  });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    recordVideo: { dir: videoDir, size: VIEWPORT },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await withCursor(page);
  console.log(`[${name}] start`);
  await run(page);
  console.log(`[${name}] closing`);
  await context.close();
  await browser.close();

  const files = fs.readdirSync(videoDir).filter((f) => f.endsWith(".webm"));
  if (!files.length) throw new Error(`no video for ${name}`);
  const dest = path.join(OUT, `${name}.webm`);
  fs.renameSync(path.join(videoDir, files[0]), dest);
  fs.rmSync(videoDir, { recursive: true, force: true });
  console.log(`[${name}] saved ${dest}`);
  return dest;
}

async function clipLanding(page) {
  await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 60000 });
  await withCursor(page);
  await page.waitForTimeout(1200);
  // hover primary CTAs if present
  const demo = page.getByRole("link", { name: /demo|try|interactive/i }).first();
  if (await demo.count()) {
    await moveTo(page, demo, 24);
    await page.waitForTimeout(600);
    await clickLoc(page, demo);
    await page.waitForURL(/\/demo/, { timeout: 15000 }).catch(() => {});
  } else {
    await page.goto(`${BASE}/demo`, { waitUntil: "networkidle" });
  }
  await withCursor(page);
  await page.waitForTimeout(1500);
}

async function clipShipDuck(page) {
  await page.goto(`${BASE}/demo`, { waitUntil: "networkidle", timeout: 60000 });
  await withCursor(page);
  await page.waitForTimeout(800);

  const redeem = page.getByRole("button", { name: /Redeem duck/i });
  await clickLoc(page, redeem);
  await page.waitForTimeout(900);

  const ship = page.getByRole("button", { name: /^!ship$/i }).first();
  await page.waitForSelector('button:has-text("!ship")', { timeout: 10000 });
  await clickLoc(page, ship);

  // Watch Codex build panel (~5 steps * ~0.9s)
  await page.waitForTimeout(6500);
  await page.waitForSelector('text=Feature by @Morgan', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(800);

  // Type LUL in chat
  const input = page.getByPlaceholder(/Send chat/i);
  await typeSlow(page, input, "LUL");
  const send = page.getByRole("button", { name: /^Send$/i });
  await clickLoc(page, send);
  await page.waitForTimeout(1800);
  await typeSlow(page, input, "LUL LUL");
  await clickLoc(page, send);
  await page.waitForTimeout(2000);
}

async function clipConfettiRaid(page) {
  await page.goto(`${BASE}/demo`, { waitUntil: "networkidle", timeout: 60000 });
  await withCursor(page);
  await page.waitForTimeout(600);

  await clickLoc(page, page.getByRole("button", { name: /Redeem confetti/i }));
  await page.waitForTimeout(700);
  await clickLoc(page, page.getByRole("button", { name: /^!ship$/i }).first());
  await page.waitForTimeout(6500);
  await clickLoc(page, page.getByRole("button", { name: /^Raid$/i }));
  await page.waitForTimeout(1500);
  await clickLoc(page, page.getByRole("button", { name: /^Cheer$/i }));
  await page.waitForTimeout(1800);
  // optional second chat
  const input = page.getByPlaceholder(/Send chat/i);
  await typeSlow(page, input, "POG");
  await clickLoc(page, page.getByRole("button", { name: /^Send$/i }));
  await page.waitForTimeout(1600);
}

async function clipDashboardOverlay(page) {
  await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle", timeout: 60000 });
  await withCursor(page);
  await page.waitForTimeout(1600);
  // wander a bit
  await page.mouse.move(200, 200, { steps: 20 });
  await page.evaluate(() => window.__csiMove?.(200, 200));
  await page.waitForTimeout(800);
  await page.mouse.move(900, 400, { steps: 25 });
  await page.evaluate(() => window.__csiMove?.(900, 400));
  await page.waitForTimeout(1000);

  await page.goto(`${BASE}/overlay/northbridge`, { waitUntil: "networkidle", timeout: 60000 });
  await withCursor(page);
  await page.waitForTimeout(2200);
  await page.mouse.move(640, 360, { steps: 18 });
  await page.waitForTimeout(1200);
}

const clips = [];
clips.push(await recordClip("01-landing-demo", clipLanding));
clips.push(await recordClip("02-ship-duck", clipShipDuck));
clips.push(await recordClip("03-confetti-raid", clipConfettiRaid));
clips.push(await recordClip("04-dashboard-overlay", clipDashboardOverlay));
console.log("ALL CLIPS", clips);
