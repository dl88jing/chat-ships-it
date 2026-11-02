/**
 * Compose final v3 demo from screen clips + Kokoro VO (reuses vo-v3 wavs).
 */
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VO = path.join(__dirname, "assets", "vo-v3");
const SCREEN = path.join(__dirname, "assets", "screen-v3");
const COMP = path.join(__dirname, "assets", "_v3compose");
const REVIEW = "/workspace/twitchcon-codex/review/v3.mp4";
const RENDER = path.join(__dirname, "renders", "chat-ships-it-demo-v3.mp4");

fs.mkdirSync(COMP, { recursive: true });
fs.mkdirSync(path.dirname(REVIEW), { recursive: true });
fs.mkdirSync(path.dirname(RENDER), { recursive: true });

const durs = JSON.parse(fs.readFileSync(path.join(VO, "durations.json"), "utf8"));
// pad each segment slightly past VO
const pad = (id) => Math.max(durs[id] + 0.55, durs[id] * 1.04);

function ff(...args) {
  const r = spawnSync("ffmpeg", ["-y", ...args], { stdio: "inherit" });
  if (r.status !== 0) throw new Error("ffmpeg failed: " + args.slice(-1));
}

function probe(p) {
  const r = spawnSync(
    "ffprobe",
    ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", p],
    { encoding: "utf8" },
  );
  return parseFloat(r.stdout.trim());
}

// Title card (reuse style via lavfi)
const titleDur = pad("vo_hook");
ff(
  "-f", "lavfi", "-i", `color=c=0x0a0a0f:s=1920x1080:d=${titleDur}`,
  "-i", path.join(VO, "vo_hook.wav"),
  "-filter_complex",
  `[0:v]drawbox=x=80:y=120:w=900:h=420:color=0x2a1048@1:t=fill,` +
    `drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='CHAT SHIPS IT':fontsize=28:fontcolor=0xa3e635:x=120:y=160,` +
    `drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='Chat Ships It':fontsize=72:fontcolor=white:x=120:y=220,` +
    `drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:text='Viewers redeem Ship a Feature.':fontsize=28:fontcolor=0xd4d4d8:x=120:y=330,` +
    `drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:text='Codex builds a sandboxed Twitch overlay — live.':fontsize=28:fontcolor=0xd4d4d8:x=120:y=375,` +
    `drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:text='Codex x TwitchCon · Green Robin Labs':fontsize=24:fontcolor=0xa1a1aa:x=120:y=440[v]`,
  "-map", "[v]", "-map", "1:a",
  "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", "-shortest",
  path.join(COMP, "00_title.mp4"),
);

// Live split (side-by-side) for vo_live
const liveDur = pad("vo_live");
ff(
  "-stream_loop", "-1", "-i", path.join(SCREEN, "split-live.mp4"),
  "-i", path.join(VO, "vo_live.wav"),
  "-t", String(liveDur),
  "-map", "0:v", "-map", "1:a",
  "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", "-shortest",
  path.join(COMP, "01_live.mp4"),
);

// Ship: use tail of 01-live screen (after ship click) — take from ~8s of live mp4 full page
const shipDur = pad("vo_ship");
ff(
  "-ss", "8", "-stream_loop", "-1", "-i", path.join(SCREEN, "01-live.mp4"),
  "-i", path.join(VO, "vo_ship.wav"),
  "-t", String(shipDur),
  "-vf", "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black,fps=30",
  "-map", "0:v", "-map", "1:a",
  "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", "-shortest",
  path.join(COMP, "02_ship.mp4"),
);

// Codex
const codexDur = pad("vo_codex");
ff(
  "-stream_loop", "-1", "-i", path.join(SCREEN, "03-codex.mp4"),
  "-i", path.join(VO, "vo_codex.wav"),
  "-t", String(codexDur),
  "-vf", "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black,fps=30",
  "-map", "0:v", "-map", "1:a",
  "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", "-shortest",
  path.join(COMP, "03_codex.mp4"),
);

// Outro
const outroDur = pad("vo_outro");
ff(
  "-f", "lavfi", "-i", `color=c=0x0a0a0f:s=1920x1080:d=${outroDur}`,
  "-i", path.join(VO, "vo_outro.wav"),
  "-filter_complex",
  `[0:v]drawbox=x=80:y=200:w=1100:h=360:color=0x2a1048@1:t=fill,` +
    `drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='Try it live':fontsize=56:fontcolor=white:x=120:y=260,` +
    `drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:text='chat-ships-it.vercel.app/live':fontsize=36:fontcolor=0xa3e635:x=120:y=350,` +
    `drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:text='Green Robin Labs · Codex x TwitchCon':fontsize=26:fontcolor=0xa1a1aa:x=120:y=440[v]`,
  "-map", "[v]", "-map", "1:a",
  "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", "-shortest",
  path.join(COMP, "04_outro.mp4"),
);

const list = path.join(COMP, "list.txt");
fs.writeFileSync(
  list,
  ["00_title", "01_live", "02_ship", "03_codex", "04_outro"]
    .map((n) => `file '${path.join(COMP, n + ".mp4")}'`)
    .join("\n") + "\n",
);

ff(
  "-f", "concat", "-safe", "0", "-i", list,
  "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", "-movflags", "+faststart",
  RENDER,
);
fs.copyFileSync(RENDER, REVIEW);
const finalDur = probe(REVIEW);
console.log("wrote", REVIEW, "duration", finalDur);
if (finalDur > 125) {
  console.warn("WARNING: over ~2 min");
}
