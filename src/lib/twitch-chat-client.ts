"use client";

/**
 * Browser Twitch IRC client (anonymous justinfan).
 * Connects to wss://irc-ws.chat.twitch.tv:443 — no OAuth / no secrets.
 */

import {
  buildAnonymousHandshake,
  parseIrcLine,
  pongFor,
  type ParsedIrc,
} from "./twitch-irc";

export type TwitchChatStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "joined"
  | "error"
  | "closed";

export type TwitchChatHandlers = {
  onStatus?: (status: TwitchChatStatus, detail?: string) => void;
  onMessage?: (msg: Extract<ParsedIrc, { type: "privmsg" }>) => void;
  onRaw?: (line: string) => void;
};

export type TwitchChatConnection = {
  close: () => void;
  status: () => TwitchChatStatus;
};

export function connectTwitchChat(
  channel: string,
  handlers: TwitchChatHandlers = {},
): TwitchChatConnection {
  let status: TwitchChatStatus = "connecting";
  const setStatus = (s: TwitchChatStatus, detail?: string) => {
    status = s;
    handlers.onStatus?.(s, detail);
  };

  const ch = channel.replace(/^#/, "").toLowerCase().trim();
  if (!ch) {
    setStatus("error", "missing channel");
    return { close: () => {}, status: () => status };
  }

  let ws: WebSocket | null = null;
  let closed = false;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let attempt = 0;

  const open = () => {
    if (closed) return;
    setStatus("connecting");
    ws = new WebSocket("wss://irc-ws.chat.twitch.tv:443");

    ws.onopen = () => {
      attempt = 0;
      setStatus("connected");
      for (const line of buildAnonymousHandshake(ch)) {
        ws?.send(line);
      }
    };

    ws.onmessage = (ev) => {
      const chunks = String(ev.data).split(/\r?\n/);
      for (const line of chunks) {
        if (!line) continue;
        handlers.onRaw?.(line);
        const parsed = parseIrcLine(line);
        if (parsed.type === "ping") {
          ws?.send(pongFor(line));
          continue;
        }
        if (parsed.type === "privmsg") {
          handlers.onMessage?.(parsed);
          continue;
        }
        if (parsed.type === "other") {
          if (parsed.command === "001" || parsed.command === "376" || parsed.command === "JOIN") {
            setStatus("joined");
          }
          // Twitch sends JOIN confirmation as user JOIN — also watch 353/366
          if (parsed.command === "366" || parsed.raw.includes(` JOIN #${ch}`)) {
            setStatus("joined");
          }
        }
      }
    };

    ws.onerror = () => {
      setStatus("error", "websocket error");
    };

    ws.onclose = () => {
      setStatus("closed");
      ws = null;
      if (closed) return;
      attempt += 1;
      const delay = Math.min(15000, 1000 * Math.pow(2, attempt));
      reconnectTimer = setTimeout(open, delay);
    };
  };

  open();

  return {
    close: () => {
      closed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      try {
        ws?.close();
      } catch {
        /* ignore */
      }
      ws = null;
      setStatus("closed");
    },
    status: () => status,
  };
}
