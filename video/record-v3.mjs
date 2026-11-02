/**
 * v3 demo: real Twitch chat side-by-side with /live, vote→ship, Codex docs.
 * Playwright Chromium recordVideo + highly visible cursor overlay.
 */
import { chromium } from "playwright-core";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "assets", "screen-v3");
const BASE = process.env.DEMO_URL || "https://chat-ships-it.vercel.app";
const CHANNEL = process.env.TWITCH_CHANNEL || "xqc";
const VIEWPORT = { width: 1280, height: 720 };

fs.mkdirSync(OUT, { recursive: true });

/** Large arrow + purple ring so it reads clearly on screen recordings. */
const CURSOR_JS = `
(() => {
  if (window.__csiCursor) return;
  const wrap = document.createElement('div');
  wrap.id = '__csi_cursor';
  wrap.innerHTML = \`
    <svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" style="display:block;filter:drop-shadow(0 2px 4px rgba(0,0,0,.7))">
      <path d="M6 4 L6 28 L13 22 L18 32 L22 30 L17 20 L26 20 Z" fill="#9146FF" stroke="#fff" stroke-width="2.5" stroke-linejoin="round"/>
    </svg>
    <div id="__csi_ring" style="position:absolute;left:2px;top:2px;width:18px;height:18px;border-radius:50%;border:3px solid #fff;background:rgba(145,70,255,.55);box-shadow:0 0 0 4px rgba(145,70,255,.35);transform:translate(-40%,-40%);pointer-events:none;opacity:0;transition:opacity .12s,transform .12s"></div>
  \`;
  wrap.style.cssText = 'position:fixed;left:40px;top:40px;width:36px;height:36px;pointer-events:none;z-index:2147483647;transform:translate(0,0);';
  document.documentElement.appendChild(wrap);
  window.__csiCursor = wrap;
  window.__csiMove = (x,y) => { wrap.style.left = x + 'px'; wrap.style.top = y + 'px'; };
  window.__csiClickFlash = () => {
    const r = document.getElementById('__csi_ring');
    if (!r) return;
    r.style.opacity = '1';
    r.style.transform = 'translate(-40%,-40%) scale(1.6)';
    setTimeout(() => { r.style.opacity = '0'; r.style.transform = 'translate(-40%,-40%) scale(1)'; }, 180);
  };
  window.addEventListener('mousemove', (e) => window.__csiMove(e.clientX, e.clientY), true);
  window.addEventListener('mousedown', () => window.__csiClickFlash(), true);
  // Keep alive across SPA navigations / Twitch re-renders
  setInterval(() => {
    if (!document.getElementById('__csi_cursor')) {
      document.documentElement.appendChild(wrap);
    }
  }, 500);
})();
`;

/** Mask common swear words in Twitch DOM chat lines. */
const TWITCH_CENSOR_JS = `
(() => {
  if (window.__csiCensor) return;
  window.__csiCensor = true;
  const BAD = ["shit","fuck","fucking","fucked","asshole","bitch","damn","cunt","dick","piss","bastard","whore","slut"];
  const RE = new RegExp("\\\\b(" + BAD.map(w => w.replace(/[.*+?^\${}()|[\\\\]\\\\]/g, "\\\\$&")).join("|") + ")\\\\b", "gi");
  const mask = (t) => t.replace(RE, (m) => "*".repeat(m.length));
  const scrub = (root) => {
    const nodes = (root || document).querySelectorAll(
      '[data-a-target="chat-line-message-body"], [data-a-target="chat-message-text"], span.text-fragment, .chat-line__message, [data-a-target="chat-line-message"]'
    );
    nodes.forEach((el) => {
      if (el.dataset.csiMasked === '1') return;
      const t = el.textContent || '';
      const m = mask(t);
      if (m !== t) {
        el.textContent = m;
        el.dataset.csiMasked = '1';
      }
    });
  };
  scrub(document);
  const obs = new MutationObserver(() => scrub(document));
  obs.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  setInterval(() => scrub(document), 400);
})();
`;

async function withCursor(page) {
  await page.addInitScript(CURSOR_JS);
  await page.evaluate(CURSOR_JS).catch(() => {});
}

async function withTwitchCensor(page) {
  await page.addInitScript(TWITCH_CENSOR_JS);
  await page.evaluate(TWITCH_CENSOR_JS).catch(() => {});
}

async function moveTo(page, locator, steps = 22) {
  const box = await locator.boundingBox();
  if (!box) return null;
  const x = box.x + box.width / 2;
  const y = box.y + Math.min(box.height / 2, 14);
  await page.mouse.move(x, y, { steps });
  await page.evaluate(([cx, cy]) => window.__csiMove?.(cx, cy), [x, y]);
  await page.waitForTimeout(120);
  return { x, y };
}

async function clickLoc(page, locator) {
  await moveTo(page, locator);
  await page.evaluate(() => window.__csiClickFlash?.());
  await locator.click({ delay: 50 }).catch(() => {});
  await page.waitForTimeout(280);
}

/** Sweep cursor so it is unmistakably visible in the recording. */
async function sweepCursor(page) {
  const pathPts = [
    [120, 140], [420, 180], [700, 220], [980, 260],
    [900, 420], [640, 480], [360, 400], [200, 300],
  ];
  for (const [x, y] of pathPts) {
    await page.mouse.move(x, y, { steps: 12 });
    await page.evaluate(([cx, cy]) => window.__csiMove?.(cx, cy), [x, y]);
    await page.waitForTimeout(80);
  }
}

async function recordClip(name, run, viewport = VIEWPORT) {
  const videoDir = path.join(OUT, `_raw_${name}`);
  fs.rmSync(videoDir, { recursive: true, force: true });
  fs.mkdirSync(videoDir, { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    args: ["--disable-dev-shm-usage", "--no-sandbox", "--autoplay-policy=no-user-gesture-required"],
  });
  const context = await browser.newContext({
    viewport,
    recordVideo: { dir: videoDir, size: viewport },
    deviceScaleFactor: 1,
    userAgent:
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });
  const page = await context.newPage();
  await withCursor(page);
  console.log(`[${name}] start`);
  try {
    await run(page, context);
  } catch (e) {
    console.error(`[${name}] error`, e);
  }
  console.log(`[${name}] closing`);
  await context.close();
  await browser.close();
  const files = fs.readdirSync(videoDir).filter((f) => f.endsWith(".webm"));
  if (!files.length) throw new Error(`no video for ${name}`);
  files.sort((a, b) => fs.statSync(path.join(videoDir, b)).size - fs.statSync(path.join(videoDir, a)).size);
  const dest = path.join(OUT, `${name}.webm`);
  fs.renameSync(path.join(videoDir, files[0]), dest);
  fs.rmSync(videoDir, { recursive: true, force: true });
  console.log(`[${name}] saved ${dest}`);
  return dest;
}

function webmToMp4(webm, mp4) {
  const r = spawnSync(
    "ffmpeg",
    ["-y", "-i", webm, "-an", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-r", "30", mp4],
    { stdio: "inherit" },
  );
  if (r.status !== 0) throw new Error("ffmpeg failed " + mp4);
}

async function dismissOverlays(page) {
  for (const label of [/Accept/i, /Agree/i, /Proceed/i, /Start Watching/i, /Accept All/i, /I Understand/i]) {
    const b = page.getByRole("button", { name: label }).first();
    if (await b.count()) {
      await clickLoc(page, b).catch(() => {});
      await page.waitForTimeout(400);
    }
  }
}

async function clipSplitLive(page) {
  await page.goto(`${BASE}/live?channel=${CHANNEL}`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await withCursor(page);
  await page.waitForTimeout(800);
  await sweepCursor(page);
  for (let i = 0; i < 25; i++) {
    const joined = await page.locator("text=/reading chat/i").count();
    const lines = await page.locator("aside .text-sm.leading-snug").count();
    console.log("wait", i, "joined", joined, "lines", lines);
    if (joined && lines >= 3) break;
    await page.waitForTimeout(1000);
  }
  await page.waitForTimeout(2500);
  const badge = page.locator("text=/LIVE · twitch.tv/i").first();
  if (await badge.count()) await moveTo(page, badge, 24);
  await page.waitForTimeout(1500);
  // Move over chat panel so cursor is visible on the right
  const chatHead = page.locator("text=/REAL TWITCH CHAT/i").first();
  if (await chatHead.count()) await moveTo(page, chatHead, 20);
  await page.waitForTimeout(1500);
  const shipBtn = page.getByRole("button", { name: /Ship leader/i }).first();
  if (await shipBtn.count()) {
    await clickLoc(page, shipBtn);
    await page.waitForTimeout(9000);
  } else {
    await page.waitForTimeout(3000);
  }
  const vote = page.locator("text=Chat vote").first();
  if (await vote.count()) await moveTo(page, vote, 18);
  await sweepCursor(page);
  await page.waitForTimeout(1500);
}

async function clipTwitchChat(page) {
  await withTwitchCensor(page);
  const url = `https://www.twitch.tv/popout/${CHANNEL}/chat?popout=`;
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
  await withCursor(page);
  await withTwitchCensor(page);
  await page.waitForTimeout(1500);
  await dismissOverlays(page);
  await dismissOverlays(page);
  await page.waitForTimeout(800);
  await sweepCursor(page);
  // Linger so masked chat fills; keep scrubbing
  for (let i = 0; i < 12; i++) {
    await page.evaluate(() => window.__csiCensor && null).catch(() => {});
    await withTwitchCensor(page);
    const x = 80 + (i % 4) * 70;
    const y = 160 + (i % 5) * 80;
    await page.mouse.move(x, y, { steps: 8 });
    await page.evaluate(([cx, cy]) => window.__csiMove?.(cx, cy), [x, y]);
    await page.waitForTimeout(900);
  }
}

async function clipCodexDocs(page) {
  await page.goto(
    "https://github.com/dl88jing/chat-ships-it/blob/main/docs/CODEX.md",
    { waitUntil: "domcontentloaded", timeout: 60000 },
  );
  await withCursor(page);
  await page.waitForTimeout(1200);
  await sweepCursor(page);
  const sid = page.locator("text=01a19592-cb14-7af0-bf46-1cec8f9b2a13").first();
  if (await sid.count()) {
    await sid.scrollIntoViewIfNeeded().catch(() => {});
    await moveTo(page, sid, 24);
  } else {
    await page.mouse.wheel(0, 600);
  }
  await page.waitForTimeout(6000);
  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  await withCursor(page);
  const live = page.getByRole("link", { name: /Live Twitch chat/i }).first();
  if (await live.count()) await moveTo(page, live, 20);
  await page.waitForTimeout(2200);
}

const liveWebm = await recordClip("01-live", clipSplitLive);
const twitchWebm = await recordClip("02-twitch-chat", clipTwitchChat, { width: 480, height: 720 });
const codexWebm = await recordClip("03-codex", clipCodexDocs);

const liveMp4 = path.join(OUT, "01-live.mp4");
const twitchMp4 = path.join(OUT, "02-twitch-chat.mp4");
const codexMp4 = path.join(OUT, "03-codex.mp4");
webmToMp4(liveWebm, liveMp4);
webmToMp4(twitchWebm, twitchMp4);
webmToMp4(codexWebm, codexMp4);

// Side-by-side: blur left chat text band as belt-and-suspenders vs residual swears
const splitMp4 = path.join(OUT, "split-live.mp4");
const ff = spawnSync(
  "ffmpeg",
  [
    "-y",
    "-t", "18", "-i", twitchMp4,
    "-t", "18", "-i", liveMp4,
    "-filter_complex",
    // Left: scale; mild boxblur on mid chat body (y~120-560) then overlay clean header/footer via crop tricks:
    // Practical approach: slight blur of entire left panel text area with a masked blur.
    "[0:v]scale=640:720:force_original_aspect_ratio=decrease,pad=640:720:(ow-iw)/2:(oh-ih)/2:black,setsar=1,split[lraw][lblur];" +
      "[lblur]crop=640:480:0:100,boxblur=8:1[lb];" +
      "[lraw][lb]overlay=0:100[left];" +
      "[1:v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2:black,setsar=1[right];" +
      "[left][right]hstack=inputs=2,scale=1920:720,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black,fps=30[v]",
    "-map", "[v]",
    "-an",
    "-c:v", "libx264",
    "-pix_fmt", "yuv420p",
    splitMp4,
  ],
  { stdio: "inherit" },
);
if (ff.status !== 0) throw new Error("split compose failed");

console.log("done clips", { liveMp4, twitchMp4, codexMp4, splitMp4 });
