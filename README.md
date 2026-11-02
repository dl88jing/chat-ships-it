# Chat Ships It

> Viewers redeem **Ship a Feature**. Codex builds a sandboxed Twitch overlay widget live on stream.

**Green Robin Labs · Northbridge** · Codex x TwitchCon Hackathon 2026 · MIT

[Live demo](https://chat-ships-it.vercel.app) · [Real Twitch chat](https://chat-ships-it.vercel.app/live?channel=xqc) · [Interactive stream](https://chat-ships-it.vercel.app/demo) · [How we used Codex](./docs/CODEX.md)

![Chat Ships It](./assets/cover.png)

## Why this wins

Most hackathon entries bolt AI onto chat. **Chat Ships It makes Codex the game mechanic.** Chat spends channel points, a mod approves, and the overlay shows Codex planning, streaming a diff, passing tests, then hot-loading a widget credited to the viewer. Fun to watch. Useful for communities. Obviously built with Codex.

## Features

- **Ship a Feature** redemption queue + mod `!ship` / `!revert` / `!remix`
- Live **“Codex is building…”** overlay panel (plan · diff · test light)
- Sandboxed widgets (`iframe sandbox="allow-scripts"`, no network)
- OBS browser source at `/overlay/[channel]` (transparent)
- Streamer dashboard + full interactive `/demo`
- Patch-notes ticker (“Feature by @viewer”)
- **Real Twitch chat ingest** via anonymous IRC on `/live?channel=` (no keys)
- **DEMO_MODE** mock Twitch auth (no Client ID required to try)
- Optional `OPENAI_API_KEY` for live `/api/build` generation
- DEMO_MODE widget pack includes rubber duck, raid confetti, emote combo, hype pill, **sub goal thermometer**
- Shared `validateWidgetHtml` sandbox scan (forbidden APIs + size) with `npm test`

## Real Twitch chat (no keys needed)

Connect anonymously to Twitch IRC from the browser — **no Client ID, no OAuth, no secrets**.

1. Open [`/live?channel=<name>`](https://chat-ships-it.vercel.app/live?channel=xqc) (also works as an OBS browser source).
2. The page dials `wss://irc-ws.chat.twitch.tv:443` with `PASS SCHMOOPIIE` + `NICK justinfan…`, requests tags/commands, and `JOIN`s the channel.
3. Real `PRIVMSG` lines (with `display-name`) feed the chat panel and the chat-vote tally (`1` / `2` / `3` or `!vote N`; `!ship` ships the leader).
4. Badge shows **LIVE · twitch.tv/&lt;channel&gt;** plus IRC connection status.

Verify locally: `npm run verify:twitch -- xqc`

**Still simulated without keys:** widget HTML uses curated Codex templates when `OPENAI_API_KEY` is unset; channel-point EventSub needs a Twitch app (see [`docs/WORKER.md`](./docs/WORKER.md)).

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000/demo](http://localhost:3000/demo).

### Environment

| Variable | Required | Notes |
|----------|----------|-------|
| `DEMO_MODE` | no (default true) | Mock Twitch OAuth + template widgets |
| `OPENAI_API_KEY` | no | Server-side only; enables live widget HTML generation |
| `TWITCH_CLIENT_ID` / `TWITCH_CLIENT_SECRET` | no | Real OAuth when DEMO_MODE=false |

**Honesty note:** This public deploy runs in **DEMO_MODE** with mock Twitch authentication because a Twitch app Client ID/Secret was not available on the build machine. The EventSub → Helix production path is documented in [`docs/WORKER.md`](./docs/WORKER.md). The overlay, build UX, sandbox, and queue are fully interactive without Twitch credentials.

## Demo video

Narrated demo (HyperFrames + Kokoro):

- **YouTube:** https://youtu.be/dPa2fA3ui2Y
- In-repo: [`video/renders/chat-ships-it-demo-v2.mp4`](./video/renders/chat-ships-it-demo-v2.mp4) (screen-recording walkthrough; v1: [`chat-ships-it-demo.mp4`](./video/renders/chat-ships-it-demo.mp4))
- GitHub Release: [v1.1.0 `chat-ships-it-demo-v2.mp4`](https://github.com/dl88jing/chat-ships-it/releases/download/v1.1.0/chat-ships-it-demo-v2.mp4)

## Codex

See [`docs/CODEX.md`](./docs/CODEX.md) for the MAIN-thread workflow and the Codex session ID (`/status`).

## Stack

- Next.js 15 (App Router) · React 19 · Tailwind 4 · Vercel
- Optional OpenAI Chat Completions for `/api/build`
- Twitch Helix + EventSub (production worker)

## License

MIT © Green Robin Labs
