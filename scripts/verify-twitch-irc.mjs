#!/usr/bin/env node
/**
 * Connect anonymously to Twitch IRC and confirm PRIVMSG arrives on a live channel.
 * Usage: node scripts/verify-twitch-irc.mjs [channel] [timeoutMs]
 */
import {
  buildAnonymousHandshake,
  parseIrcLine,
  pongFor,
} from "../src/lib/twitch-irc.ts";

const channel = (process.argv[2] || "xqc").replace(/^#/, "").toLowerCase();
const timeoutMs = Number(process.argv[3] || 12000);

const ws = new WebSocket("wss://irc-ws.chat.twitch.tv:443");
let msgs = 0;
const samples = [];

const done = (ok, reason) => {
  console.log(JSON.stringify({ ok, channel, msgs, samples, reason }, null, 2));
  try { ws.close(); } catch {}
  process.exit(ok ? 0 : 1);
};

const timer = setTimeout(() => done(msgs > 0, msgs > 0 ? "timeout_with_messages" : "timeout_no_messages"), timeoutMs);

ws.addEventListener("open", () => {
  for (const line of buildAnonymousHandshake(channel)) ws.send(line);
});

ws.addEventListener("message", (ev) => {
  for (const line of String(ev.data).split(/\r?\n/)) {
    if (!line) continue;
    const parsed = parseIrcLine(line);
    if (parsed.type === "ping") {
      ws.send(pongFor(line));
      continue;
    }
    if (parsed.type === "privmsg") {
      msgs += 1;
      if (samples.length < 5) {
        samples.push({ user: parsed.displayName, text: parsed.text.slice(0, 80) });
      }
      if (msgs >= 3) {
        clearTimeout(timer);
        done(true, "received_privmsg");
      }
    }
  }
});

ws.addEventListener("error", () => {
  clearTimeout(timer);
  done(false, "ws_error");
});
