# How we used OpenAI Codex

**Hackathon:** Codex x TwitchCon  
**Project:** Chat Ships It  
**Affiliation:** Green Robin Labs (Northbridge)

Codex is both the **build tool** and the **on-stream game mechanic**. Judges should see Codex in the demo video twice: (1) authoring this repo, (2) shipping a viewer feature live on the overlay.

## 1. Build-time — Codex authored the product

Primary workflow (MAIN thread):

1. Scaffold Next.js 15 App Router + Tailwind overlay/dashboard/demo routes.
2. Implement the sandboxed widget API (`onChat` / `onCheer` / `onRaid` via `postMessage`).
3. Build the “Codex is building…” panel (plan steps, streaming diff, test light).
4. Wire DEMO_MODE mock Twitch OAuth + simulated EventSub redemptions.
5. Add `/api/build` with optional OpenAI generation and forbidden-API scan.
6. Write README, AGENTS.md, submission copy, and HyperFrames demo script.

Side threads / `codex exec`-style tasks:

- Widget templates (rubber duck, raid confetti, emote combo, hype pill)
- Validator notes (size budget, CSP, Playwright smoke test checklist)
- Pitch deck outline and demo narration

### Codex session IDs (evidence for Devpost)

Session IDs are not secrets. Paste these on the Devpost form and keep them in this file.

```
CODEX_SESSION_ID: 01a19592-cb14-7af0-bf46-1cec8f9b2a13
```

| Session ID | When (America/Los_Angeles) | Prompt (summary) | What Codex built |
|------------|----------------------------|------------------|------------------|
| `01a19592-cb14-7af0-bf46-1cec8f9b2a13` | Sat Oct 31, 2026 ~10:26–10:27 PM PT | Non-interactive `codex exec --dangerously-bypass-approvals-and-sandbox` in-repo: add a fifth DEMO_MODE overlay widget, extract reusable sandbox validation, add `npm test`, keep under 15 minutes | **Sub Goal Thermometer** widget (`sub-goal`); `src/lib/sandbox-validate.ts` (`validateWidgetHtml`); wired into `build-server.ts`; `scripts/sandbox-validate.test.mjs` (4 tests); `npm test` script. Commit: `6810805`. |

Prompt used for the recorded session (abridged):

> Add one new DEMO_MODE overlay widget template that chat can request (Sub Goal Thermometer, id `sub-goal`), harden sandbox validation into a reusable module (`validateWidgetHtml` rejecting fetch/XHR/WebSocket/cookie/eval/Function/script-src/import/sendBeacon and >12KB HTML), wire it through `build-server.ts`, add Node tests + `npm test`, run tests and build until green. Do not commit secrets; affiliation Green Robin Labs; no push.

Verification for that session: `npm test` (4 pass) and `npm run build` succeeded before commit.

## 2. Runtime — Codex ships chat’s features

When a mod runs `!ship`:

1. Request is queued from channel-point redemption (or DEMO_MODE simulate).
2. Build panel shows live plan steps (`codex exec · sandbox workspace-write`).
3. Diff lines stream into the overlay.
4. Tests light turns green; widget HTML hot-loads into a sandboxed iframe.
5. Patch-notes ticker credits the viewer: **Feature by @viewer**.

With `OPENAI_API_KEY` set, `/api/build` generates fresh HTML server-side. Without it, curated templates still play the full Codex UX so the stream never stalls on quota. DEMO_MODE templates now include rubber duck, raid confetti, emote combo, hype pill, and **sub goal thermometer**.

## 3. What to show judges (≤3 min video)

| Time | Shot |
|------|------|
| 0:00 | Hook — viewer redeems Ship a Feature |
| 0:20 | Mod hits `!ship` on the dashboard |
| 0:30 | Overlay “Codex is building…” panel (plan + diff) |
| 1:15 | Widget appears and reacts to chat (`LUL` → duck) |
| 1:40 | Second redemption / remix |
| 2:10 | `!revert` |
| 2:25 | This file + MAIN thread `/status` session ID |
| 2:50 | Outro — repo + live demo URL |

Demo video (YouTube): https://youtu.be/ghyZRheHwsg

## 4. AGENTS.md

Repo-root `AGENTS.md` is the contract Codex (and other agents) follow: no secrets, sandbox rules, widget API, pseudonyms.


## Demo video v1.1.0 (screen recording)

After the Codex build pass (`01a19592-cb14-7af0-bf46-1cec8f9b2a13`), we recorded a real walkthrough of the live app with Playwright (headless Chromium `recordVideo` 1920×1080, visible cursor overlay, realistic typing) and rebuilt the HyperFrames composition so screen footage is ~75% of runtime with Kokoro narration.

- Clips: `video/assets/screen/01-landing-demo-pad.mp4` … `04-dashboard-overlay.mp4`
- Narration: `video/assets/vo-v2/*.wav` (Kokoro `af_heart`)
- Render: `video/renders/chat-ships-it-demo-v2.mp4` (~88.8s, 1920×1080)
- Release: `v1.1.0`
