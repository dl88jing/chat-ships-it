# AGENTS.md — Chat Ships It

Conventions for humans and coding agents (Codex, etc.) working in this repo.

## Product
Chat Ships It lets Twitch viewers redeem **Ship a Feature**. A sandboxed Codex/OpenAI worker writes a tiny overlay widget that hot-loads into the OBS browser source.

## Hard rules
- Never commit secrets. `.env*` is gitignored; only `.env.example` is tracked.
- Widgets must run in `iframe sandbox="allow-scripts"` with no network (no `fetch`, XHR, WebSocket, remote `<script src>`).
- Mod approval (`!ship`) is required before a build starts.
- Public copy uses pseudonyms: Northbridge, Avery, Morgan, River. Affiliation: **Green Robin Labs** (never Adobe).
- Prefer DEMO_MODE templates when `OPENAI_API_KEY` is unset so the demo never dies.

## Widget API (postMessage bus)
Parent → iframe:
- `{ type: "chat", user, text }`
- `{ type: "cheer", user, bits }`
- `{ type: "raid", from, viewers }`

Iframe → parent:
- `{ type: "widget-ready", id }`

## Layout
- `src/app` — Next.js App Router (landing, `/demo`, `/dashboard`, `/overlay/[channel]`, APIs)
- `src/lib/widgets.ts` — DEMO_MODE templates + materialize
- `src/lib/demo-store.ts` — client demo EventSub/chat/build loop
- `src/lib/build-server.ts` — server build (OpenAI if keyed, else template)
- `docs/CODEX.md` — how Codex was used (required for judges)

## Commands
```bash
npm install
npm run dev
npm run build
```
