/**
 * Pure Twitch IRC message parser (anonymous justinfan path).
 * No secrets — PASS SCHMOOPIIE is Twitch's public anonymous password.
 */

export type IrcTags = Record<string, string>;

export type ParsedIrc =
  | { type: "ping"; raw: string }
  | { type: "privmsg"; channel: string; user: string; displayName: string; text: string; color: string; tags: IrcTags; raw: string }
  | { type: "other"; command: string; raw: string };

/** Split IRCv3 tags from `@key=val;key2=val2` into a map (values unescaped). */
export function parseTags(tagStr: string): IrcTags {
  const out: IrcTags = {};
  if (!tagStr) return out;
  const body = tagStr.startsWith("@") ? tagStr.slice(1) : tagStr;
  for (const part of body.split(";")) {
    if (!part) continue;
    const eq = part.indexOf("=");
    if (eq === -1) {
      out[part] = "";
      continue;
    }
    const key = part.slice(0, eq);
    const raw = part.slice(eq + 1);
    out[key] = raw
      .replace(/\\:/g, ";")
      .replace(/\\s/g, " ")
      .replace(/\\\\/g, "\\")
      .replace(/\\r/g, "\r")
      .replace(/\\n/g, "\n");
  }
  return out;
}

/**
 * Parse one IRC line from Twitch (may include tags).
 * Handles PING and PRIVMSG; everything else is `other`.
 */
export function parseIrcLine(line: string): ParsedIrc {
  const raw = line.replace(/\r$/, "");
  if (!raw) return { type: "other", command: "", raw };

  if (raw.startsWith("PING ")) {
    return { type: "ping", raw };
  }

  let rest = raw;
  let tags: IrcTags = {};
  if (rest.startsWith("@")) {
    const sp = rest.indexOf(" ");
    if (sp === -1) return { type: "other", command: "", raw };
    tags = parseTags(rest.slice(0, sp));
    rest = rest.slice(sp + 1);
  }

  // :<prefix> COMMAND params
  let prefix = "";
  if (rest.startsWith(":")) {
    const sp = rest.indexOf(" ");
    if (sp === -1) return { type: "other", command: "", raw };
    prefix = rest.slice(1, sp);
    rest = rest.slice(sp + 1);
  }

  const sp = rest.indexOf(" ");
  const command = sp === -1 ? rest : rest.slice(0, sp);
  const params = sp === -1 ? "" : rest.slice(sp + 1);

  if (command === "PRIVMSG") {
    // #channel :message
    const colon = params.indexOf(" :");
    const channelPart = colon === -1 ? params : params.slice(0, colon);
    const text = colon === -1 ? "" : params.slice(colon + 2);
    const channel = channelPart.trim().replace(/^#/, "").toLowerCase();
    const nick = prefix.includes("!") ? prefix.slice(0, prefix.indexOf("!")) : prefix;
    const displayName = tags["display-name"] || nick || "unknown";
    const color = tags.color && tags.color !== "" ? tags.color : "#9146FF";
    return {
      type: "privmsg",
      channel,
      user: nick,
      displayName,
      text,
      color,
      tags,
      raw,
    };
  }

  return { type: "other", command, raw };
}

/** Build the anonymous login handshake lines for a channel. */
export function buildAnonymousHandshake(channel: string, nickDigits?: string): string[] {
  const digits = nickDigits ?? String(Math.floor(10000000 + Math.random() * 90000000));
  const nick = `justinfan${digits}`;
  const ch = channel.replace(/^#/, "").toLowerCase();
  return [
    "PASS SCHMOOPIIE",
    `NICK ${nick}`,
    "CAP REQ :twitch.tv/tags twitch.tv/commands",
    `JOIN #${ch}`,
  ];
}

/** Reply payload for a PING line. */
export function pongFor(pingLine: string): string {
  if (pingLine.startsWith("PING ")) {
    return "PONG " + pingLine.slice(5);
  }
  return "PONG :tmi.twitch.tv";
}

/** Detect chat vote intents used by /live tally. */
export type VoteIntent =
  | { kind: "vote"; option: number }
  | { kind: "ship" }
  | { kind: "none" };

export function parseVoteIntent(text: string): VoteIntent {
  const t = text.trim();
  if (/^!ship\b/i.test(t)) return { kind: "ship" };
  const m = t.match(/^!vote\s+(\d+)\b/i) || t.match(/^(\d)\s*$/);
  if (m) {
    const n = Number(m[1]);
    if (n >= 1 && n <= 9) return { kind: "vote", option: n };
  }
  return { kind: "none" };
}
