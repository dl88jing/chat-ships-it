# EventSub worker (production path)

The Vercel app ships a full DEMO_MODE experience. For a real channel, run a long-lived Node 22 worker (Fly/Railway/box) that:

1. Connects to Twitch EventSub over **WebSocket** (Example Chatbot pattern).
2. Listens for `channel.chat.message`, `channel.channel_points_custom_reward_redemption.add`, `channel.raid`, `channel.cheer`.
3. Posts chat via Helix `POST /helix/chat/messages`.
4. On `!ship N`, calls the same build pipeline as `/api/build` (or `codex exec` via `@openai/codex-sdk` in a temp dir with `--sandbox workspace-write`).
5. Pushes build-progress + widget bundles to the overlay (SSE/websocket of your choice).

Env vars: see `.env.example`. Keep tokens server-side only.
