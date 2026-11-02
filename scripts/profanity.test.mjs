import test from "node:test";
import assert from "node:assert/strict";

// Inline mirror of src/lib/profanity.ts for node:test without a TS loader
const BAD = ["shit","fuck","fucking","fucked","asshole","bitch","damn","cunt","dick","piss","bastard","whore","slut"];
const RE = new RegExp(`\\b(${BAD.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`, "gi");
function maskProfanity(text) {
  if (!text) return text;
  return text.replace(RE, (m) => "*".repeat(m.length));
}

test("masks shit", () => {
  assert.equal(maskProfanity("oh shit dude"), "oh **** dude");
});
test("preserves clean text", () => {
  assert.equal(maskProfanity("LUL PogChamp"), "LUL PogChamp");
});
test("case insensitive", () => {
  assert.equal(maskProfanity("SHIT"), "****");
});
test("does not break vote tokens", () => {
  assert.equal(maskProfanity("!vote 2"), "!vote 2");
  assert.equal(maskProfanity("!ship"), "!ship");
});
