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

### Codex session ID

Type `/status` in the Codex thread where most of the build happened and paste the session ID below.

```
CODEX_SESSION_ID: <PASTE_FROM_/status>
```

> If this line still says `PASTE`, open Codex on the machine that built the repo, run `/status` in the MAIN thread, and update this file + the Devpost form before final submit. Session IDs are not secrets.

## 2. Runtime — Codex ships chat’s features

When a mod runs `!ship`:

1. Request is queued from channel-point redemption (or DEMO_MODE simulate).
2. Build panel shows live plan steps (`codex exec · sandbox workspace-write`).
3. Diff lines stream into the overlay.
4. Tests light turns green; widget HTML hot-loads into a sandboxed iframe.
5. Patch-notes ticker credits the viewer: **Feature by @viewer**.

With `OPENAI_API_KEY` set, `/api/build` generates fresh HTML server-side. Without it, curated templates still play the full Codex UX so the stream never stalls on quota.

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

## 4. AGENTS.md

Repo-root `AGENTS.md` is the contract Codex (and other agents) follow: no secrets, sandbox rules, widget API, pseudonyms.
