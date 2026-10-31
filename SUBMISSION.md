# Devpost submission — Chat Ships It

Hackathon: **Codex x TwitchCon** (https://twitchcon-codex.devpost.com/)  
Deadline: Mon Nov 2, 2026, 2:00 PM PT  
Entrant Devpost: **dl88jing** · GitHub: **dl88jing** · Affiliation: **Green Robin Labs** (never Adobe)  
Public copy uses pseudonyms: Northbridge, Avery, Morgan, River.

---

## Title
Chat Ships It

## Tagline
Viewers redeem Ship a Feature. Codex builds a sandboxed Twitch overlay widget live on stream.

## Project URL / website
https://chat-ships-it.vercel.app

## Demo video (YouTube — REQUIRED)
**STATUS: NEEDS HUMAN** — Devpost requires a public or unlisted YouTube URL (max 3 min).  
Upload this file, then paste the YouTube link on the form:

- Local / repo: `chat-ships-it/video/renders/chat-ships-it-demo.mp4` (~68s, 1920×1080, narrated)
- GitHub Release asset: https://github.com/dl88jing/chat-ships-it/releases/download/v1.0.0/chat-ships-it-demo.mp4
- Release page: https://github.com/dl88jing/chat-ships-it/releases/tag/v1.0.0

Suggested YouTube title: `Chat Ships It — Codex builds Twitch overlay widgets live (Codex x TwitchCon)`  
Suggested description: include live demo URL + repo URL; no copyrighted music (Kokoro TTS only).

## Repository
https://github.com/dl88jing/chat-ships-it  
(public, MIT, all source + assets + run instructions)

## Cover image (3:2)
`chat-ships-it/assets/cover.png` (1800×1200)  
Also: https://github.com/dl88jing/chat-ships-it/releases/download/v1.0.0/cover.png

## Gallery images (3–5)
1. `assets/gallery/01-landing.png` — marketing landing
2. `assets/gallery/02-demo.png` — interactive demo (chat + queue)
3. `assets/gallery/03-demo-building.png` — Codex is building panel
4. `assets/gallery/04-dashboard.png` — streamer/mod dashboard
5. `assets/gallery/05-overlay.png` — OBS overlay

## Pitch deck
- `deck/Chat-Ships-It-Pitch.pptx`
- `deck/Chat-Ships-It-Pitch.pdf`  
Release: https://github.com/dl88jing/chat-ships-it/releases/download/v1.0.0/Chat-Ships-It-Pitch.pdf

---

## Built with (tags)
- openai-codex
- openai
- twitch
- twitch-api
- eventsub
- nextjs
- react
- typescript
- vercel
- tailwindcss
- hyperframes
- kokoro

---

## Inspiration
Twitch overlays are usually frozen: a streamer installs a few widgets once and they never change. Chat wants to *ship* features — rubber ducks that quack on LUL, raid confetti, hype pills — but today that means filing a request and waiting for a developer.

OpenAI Codex can write small, scoped UI in under a minute. We asked: what if **Codex itself is the game mechanic**? Not a chatbot bolted onto Twitch, but a live “chat ships it” loop where viewers spend channel points, mods approve with `!ship`, and the whole channel watches Codex plan, diff, test, and hot-load a widget onto the OBS overlay — credited to the viewer who asked.

That’s the booth moment: judges don’t just hear that we used Codex; they *watch* Codex ship on stream.

## What it does
**Chat Ships It** is a Twitch-connected overlay + dashboard + interactive demo:

1. A viewer redeems a **Ship a Feature** channel-point reward with a one-line request (e.g. “rubber duck that quacks on LUL”).
2. The request lands in a mod queue. A streamer/mod approves with **`!ship`** (or the dashboard Approve button).
3. The OBS overlay shows a live **“Codex is building…”** panel: plan steps, streaming diff lines, and a test pass/fail light.
4. ~60–90s later the widget **hot-loads** into a sandboxed iframe (`sandbox="allow-scripts"`, CSP blocks network) and reacts to chat/cheers/raids via a strict widget API (`onChat` / `onCheer` / `onRaid`).
5. A **patch-notes ticker** credits the viewer: *Feature by @Morgan*. Chat can **`!revert`** or **`!remix`**.

**Live now (DEMO_MODE):** https://chat-ships-it.vercel.app/demo — full interactive loop with mock Twitch auth (honest: no Twitch Client ID was available on the build machine). Production EventSub/Helix path is documented in `docs/WORKER.md`. Optional `OPENAI_API_KEY` enables live `/api/build` generation; without it, curated templates still play the full Codex UX so streams never stall on quota.

## How we built it
- **Next.js 15 App Router + React 19 + Tailwind 4** on **Vercel**
  - `/` landing · `/demo` interactive stream · `/dashboard` mod queue · `/overlay/[channel]` OBS browser source
  - `/api/auth/*` Twitch OAuth (mock in DEMO_MODE) · `/api/build` optional OpenAI widget generation · `/api/health`
- **Sandboxed widget runtime** — `iframe` with `allow-scripts` only, postMessage host API, size/CPU budget, forbidden-API scan
- **Codex as dual role** — build-time author of the product (`docs/CODEX.md`, `AGENTS.md`) and runtime “mechanic” shown on the overlay
- **HyperFrames + Kokoro** narrated demo (~68s) at `video/renders/chat-ships-it-demo.mp4`
- **Avoided Twitch Extensions** (5–14 day review; judges can’t install unreviewed extensions) — used chat, overlays, Helix, EventSub as recommended

## Challenges we ran into
- **No Twitch Client ID / OpenAI key on the build box** → shipped honest DEMO_MODE with mock OAuth + template widgets, and documented the real worker path instead of faking credentials.
- **Keeping Codex visible and safe** → every generated widget must pass a forbidden-API scan and run without network; mods must approve before ship.
- **Making a ≤3 min demo that proves both Twitch + Codex** → HyperFrames composition with GSAP `window.__timelines` so frames actually render (first pass was audio-only black video; fixed and re-verified).
- **Hackathon Stage 1 is pass/fail on “connects to Twitch + built with Codex”** → README, video, and `docs/CODEX.md` make both connections impossible to miss.

## Accomplishments that we're proud of
- Codex is the **gameplay**, not a footnote — the overlay’s “Codex is building…” panel is the show.
- A polished public deploy + interactive demo that works with zero secrets.
- Sandboxed-by-design widgets (CSP, no network, kill switch) so chat can’t pwn the stream.
- A complete submission kit: repo, Vercel app, narrated video, 3:2 cover, gallery, pitch deck PDF/PPTX, Codex docs.

## What we learned
- Judges may score from video + description alone (and AI-assisted judging is allowed) — clarity and a scannable README matter as much as code.
- Twitch Extensions are a trap for short hackathons; chat + EventSub + overlays ship faster.
- Showing the agent *working* (plan → diff → tests → hot-load) converts “we used Codex” into something fun to watch.

## What's next
- Wire a production EventSub WebSocket worker (`docs/WORKER.md`) with real Helix chat + channel-point redemptions.
- Cap concurrent Codex builds, add OpenAI moderation on redemption text, and a 30s widget kill switch in the host.
- Stretch: **Raid ships a feature** — when Avery raids Morgan, the raid carries a co-authored widget as a souvenir.
- Freeze this repo after Devpost submit until Nov 15 (keep iterating in a copy).

---

## How we used Codex (required narrative for form + video)
See full write-up: https://github.com/dl88jing/chat-ships-it/blob/main/docs/CODEX.md

**Build-time:** Codex (MAIN thread) scaffolded the Next.js app, widget sandbox, overlay build panel, DEMO_MODE auth, `/api/build`, docs, and demo script. Side threads authored widget templates and deck/narration.

**Runtime:** When a mod ships, the overlay dramatizes `codex exec`-style plan/diff/test; with `OPENAI_API_KEY`, `/api/build` generates fresh HTML server-side.

### Codex Session ID (REQUIRED on Devpost form)
```
CODEX_SESSION_ID: <PASTE_FROM_/status>
```
**STATUS: NEEDS HUMAN** — Sign in to Codex / ChatGPT, open the MAIN build thread for this project, type `/status`, paste the session ID into:
1. This field on Devpost
2. `docs/CODEX.md` and `public/docs/CODEX.md` in the repo (then commit + push)

Session IDs are not secrets. Do **not** use the smoke-test session on the build box (`01a179e7-…` under `/tmp/codex-smoke`) — that is unrelated.

---

## Extra Devpost form fields / answers

| Field | Answer |
|-------|--------|
| Project name | Chat Ships It |
| Tagline | Viewers redeem Ship a Feature. Codex builds a sandboxed Twitch overlay widget live on stream. |
| "Built with" / technologies | openai-codex, openai, twitch, twitch-api, eventsub, nextjs, react, typescript, vercel, tailwindcss, hyperframes, kokoro |
| GitHub / GitLab / Bitbucket URL | https://github.com/dl88jing/chat-ships-it |
| Demo / website URL | https://chat-ships-it.vercel.app |
| Demo video URL | **(YouTube URL after upload)** |
| Codex Session ID | **(paste from `/status`)** |
| How did you use Codex? | See “How we used Codex” section above + `docs/CODEX.md`. Codex authored the product and is the on-stream mechanic. |
| Testing instructions | `npm i && cp .env.example .env.local && npm run dev` → open `/demo`. Or visit https://chat-ships-it.vercel.app/demo. Set `DEMO_MODE=true` (default). Optional: `OPENAI_API_KEY`, `TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET`. Never commit secrets. |
| Team / individual | Individual (dl88jing) · Green Robin Labs / Northbridge |
| Eligibility | Individual over age of majority; not a company entry; affiliation Green Robin Labs for public copy only |
| Twitch connection | Channel-point redemptions, chat commands (`!ship`/`!revert`/`!remix`), OBS overlay, Helix OAuth, EventSub (production worker documented). No Extension (review latency). |
| Video shows Twitch + Codex? | Yes — redemption/queue/overlay build panel + Codex docs/`/status` callout. Upload MP4 to YouTube first. |

---

## Links checklist (paste into form)

- Repo: https://github.com/dl88jing/chat-ships-it
- Live app: https://chat-ships-it.vercel.app
- Interactive demo: https://chat-ships-it.vercel.app/demo
- Overlay example: https://chat-ships-it.vercel.app/overlay/northbridge
- Codex docs: https://github.com/dl88jing/chat-ships-it/blob/main/docs/CODEX.md
- Release (demo MP4): https://github.com/dl88jing/chat-ships-it/releases/tag/v1.0.0
- Demo MP4 direct: https://github.com/dl88jing/chat-ships-it/releases/download/v1.0.0/chat-ships-it-demo.mp4
- Pitch PDF: https://github.com/dl88jing/chat-ships-it/releases/download/v1.0.0/Chat-Ships-It-Pitch.pdf
- Cover: https://github.com/dl88jing/chat-ships-it/releases/download/v1.0.0/cover.png
- YouTube: **TBD — human upload**
- Codex session ID: **TBD — human `/status`**

---

## Human remaining (cannot automate without Dylan’s accounts)

1. **YouTube** — upload `chat-ships-it-demo.mp4` (public or unlisted), paste URL on Devpost.
2. **Codex `/status`** — MAIN thread session ID → Devpost + `docs/CODEX.md`.
3. **Devpost submit** — log in as dl88jing, create/enter Submission (not draft), attach cover + gallery, fill every story section from this file, hit Submit before Mon Nov 2 2:00 PM PT.
4. Optional: register Twitch app + set Vercel env (`TWITCH_*`, `OPENAI_API_KEY`, `DEMO_MODE=false`) for a real-channel clip in the YouTube video.
5. After submit: freeze this repo until Nov 15; iterate in a fork/copy.
