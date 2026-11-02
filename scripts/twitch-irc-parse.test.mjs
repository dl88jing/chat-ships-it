import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import path from "node:path";
import { register } from "node:module";

// Load TS via experimental strip-types by dynamic import of .ts through a shim:
// Node --experimental-strip-types can import .ts directly.
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const modUrl = pathToFileURL(path.join(root, "src/lib/twitch-irc.ts")).href;

const {
  parseIrcLine,
  parseTags,
  buildAnonymousHandshake,
  pongFor,
  parseVoteIntent,
} = await import(modUrl);

test("parseTags unescapes IRCv3 values", () => {
  const tags = parseTags("@display-name=Cool\\sName;color=#FF0000;subscriber=1");
  assert.equal(tags["display-name"], "Cool Name");
  assert.equal(tags.color, "#FF0000");
  assert.equal(tags.subscriber, "1");
});

test("parseIrcLine handles PING", () => {
  const p = parseIrcLine("PING :tmi.twitch.tv");
  assert.equal(p.type, "ping");
  assert.equal(pongFor("PING :tmi.twitch.tv"), "PONG :tmi.twitch.tv");
});

test("parseIrcLine parses PRIVMSG with display-name", () => {
  const line =
    "@badge-info=;badges=;color=#FF69B4;display-name=PixelFox;emotes=;id=abc;mod=0;room-id=1;subscriber=0;tmi-sent-ts=1;turbo=0;user-id=2;user-type= :pixelfox!pixelfox@pixelfox.tmi.twitch.tv PRIVMSG #xqc :hello world LUL";
  const p = parseIrcLine(line);
  assert.equal(p.type, "privmsg");
  if (p.type !== "privmsg") return;
  assert.equal(p.channel, "xqc");
  assert.equal(p.user, "pixelfox");
  assert.equal(p.displayName, "PixelFox");
  assert.equal(p.text, "hello world LUL");
  assert.equal(p.color, "#FF69B4");
});

test("buildAnonymousHandshake uses justinfan + JOIN", () => {
  const lines = buildAnonymousHandshake("XQC", "12345678");
  assert.deepEqual(lines, [
    "PASS SCHMOOPIIE",
    "NICK justinfan12345678",
    "CAP REQ :twitch.tv/tags twitch.tv/commands",
    "JOIN #xqc",
  ]);
});

test("parseVoteIntent", () => {
  assert.deepEqual(parseVoteIntent("2"), { kind: "vote", option: 2 });
  assert.deepEqual(parseVoteIntent("!vote 3"), { kind: "vote", option: 3 });
  assert.deepEqual(parseVoteIntent("!ship now"), { kind: "ship" });
  assert.deepEqual(parseVoteIntent("LUL"), { kind: "none" });
});
