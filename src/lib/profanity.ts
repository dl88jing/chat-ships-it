/** Lightweight display-side mask for OBS / public overlays. Not a full moderation system. */

const BAD = [
  "shit",
  "fuck",
  "fucking",
  "fucked",
  "asshole",
  "bitch",
  "damn",
  "cunt",
  "dick",
  "piss",
  "bastard",
  "whore",
  "slut",
];

const RE = new RegExp(`\\b(${BAD.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`, "gi");

/** Replace whole-word profanity with asterisks of the same length. */
export function maskProfanity(text: string): string {
  if (!text) return text;
  return text.replace(RE, (m) => "*".repeat(m.length));
}
