const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.author = "Green Robin Labs";
pres.title = "Chat Ships It — Codex x TwitchCon";
pres.subject = "Hackathon pitch deck";

const BG = "09090B";
const FG = "FAFAFA";
const MUTED = "A1A1AA";
const VIOLET = "9146FF";
const EMERALD = "10B981";
const CARD = "18181B";

function bg(slide) {
  slide.background = { color: BG };
}

// 1 Cover
{
  const s = pres.addSlide();
  bg(s);
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.18, h: 7.5, fill: { color: VIOLET } });
  s.addText("CODEX × TWITCHCON HACKATHON", {
    x: 0.7, y: 1.6, w: 12, h: 0.35,
    fontFace: "Arial", fontSize: 14, color: EMERALD, bold: true, charSpacing: 3,
  });
  s.addText("Chat Ships It", {
    x: 0.7, y: 2.1, w: 12, h: 1,
    fontFace: "Arial", fontSize: 54, bold: true, color: FG, margin: 0,
  });
  s.addText("Viewers redeem a feature. Codex builds it live on the overlay.", {
    x: 0.7, y: 3.2, w: 10, h: 0.6,
    fontFace: "Arial", fontSize: 20, color: MUTED, margin: 0,
  });
  s.addText("Green Robin Labs  ·  Northbridge  ·  2026", {
    x: 0.7, y: 6.6, w: 10, h: 0.35,
    fontFace: "Arial", fontSize: 14, color: MUTED,
  });
}

// 2 Problem
{
  const s = pres.addSlide();
  bg(s);
  s.addText("The gap", {
    x: 0.7, y: 0.5, w: 12, h: 0.5,
    fontFace: "Arial", fontSize: 14, color: EMERALD, bold: true, charSpacing: 2,
  });
  s.addText("Chat wants to play.\nOverlays stay static.", {
    x: 0.7, y: 1.1, w: 12, h: 1.4,
    fontFace: "Arial", fontSize: 36, bold: true, color: FG, margin: 0,
  });
  const cards = [
    ["Polls & Twitch Plays", "Been done. Judges asked for original ideas."],
    ["Custom overlays", "Dev time per widget. Chat can't invent mid-stream."],
    ["AI co-hosts", "Talks about the stream. Doesn't change what's on screen."],
  ];
  cards.forEach((c, i) => {
    const x = 0.7 + i * 4.1;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y: 3.2, w: 3.8, h: 2.6,
      fill: { color: CARD }, rectRadius: 0.12,
      line: { color: "27272A", width: 1 },
    });
    s.addText(c[0], { x: x + 0.25, y: 3.45, w: 3.3, h: 0.6, fontFace: "Arial", fontSize: 18, bold: true, color: FG, margin: 0 });
    s.addText(c[1], { x: x + 0.25, y: 4.2, w: 3.3, h: 1.3, fontFace: "Arial", fontSize: 14, color: MUTED, margin: 0 });
  });
}

// 3 Solution
{
  const s = pres.addSlide();
  bg(s);
  s.addText("The mechanic", {
    x: 0.7, y: 0.5, w: 12, h: 0.4,
    fontFace: "Arial", fontSize: 14, color: EMERALD, bold: true, charSpacing: 2,
  });
  s.addText("Codex is the gameplay.", {
    x: 0.7, y: 1.0, w: 12, h: 0.7,
    fontFace: "Arial", fontSize: 36, bold: true, color: FG, margin: 0,
  });
  const steps = [
    ["01", "Redeem", "Viewer spends channel points: “Ship a Feature”"],
    ["02", "Approve", "Mod runs !ship — nothing ships without a human"],
    ["03", "Build", "Overlay shows Codex plan → diff → tests"],
    ["04", "Hot-load", "Sandboxed widget appears. Feature by @viewer"],
  ];
  steps.forEach((st, i) => {
    const x = 0.7 + i * 3.15;
    s.addText(st[0], { x, y: 2.2, w: 2.8, h: 0.4, fontFace: "Arial", fontSize: 14, color: VIOLET, bold: true, margin: 0 });
    s.addText(st[1], { x, y: 2.7, w: 2.8, h: 0.5, fontFace: "Arial", fontSize: 22, bold: true, color: FG, margin: 0 });
    s.addText(st[2], { x, y: 3.35, w: 2.9, h: 1.4, fontFace: "Arial", fontSize: 14, color: MUTED, margin: 0 });
  });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.7, y: 5.2, w: 11.9, h: 1.5,
    fill: { color: CARD }, rectRadius: 0.12,
    line: { color: "065F46", width: 1 },
  });
  s.addText("Sandbox: iframe allow-scripts · CSP blocks network · size/CPU budget · 30s kill switch · OpenAI moderation on prompts", {
    x: 0.95, y: 5.55, w: 11.4, h: 0.9,
    fontFace: "Arial", fontSize: 16, color: EMERALD, margin: 0,
  });
}

// 4 Demo
{
  const s = pres.addSlide();
  bg(s);
  s.addText("Try it", {
    x: 0.7, y: 0.5, w: 12, h: 0.4,
    fontFace: "Arial", fontSize: 14, color: EMERALD, bold: true, charSpacing: 2,
  });
  s.addText("Live in one click.", {
    x: 0.7, y: 1.0, w: 12, h: 0.7,
    fontFace: "Arial", fontSize: 36, bold: true, color: FG, margin: 0,
  });
  const links = [
    ["Demo", "chat-ships-it.vercel.app/demo"],
    ["Overlay", "…/overlay/northbridge"],
    ["Repo", "github.com/dl88jing/chat-ships-it"],
    ["Codex docs", "docs/CODEX.md · /status session ID"],
  ];
  links.forEach((l, i) => {
    const y = 2.1 + i * 1.05;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.7, y, w: 11.9, h: 0.9,
      fill: { color: CARD }, rectRadius: 0.1,
      line: { color: "27272A", width: 1 },
    });
    s.addText(l[0], { x: 1.0, y: y + 0.25, w: 2.5, h: 0.4, fontFace: "Arial", fontSize: 18, bold: true, color: VIOLET, margin: 0 });
    s.addText(l[1], { x: 3.6, y: y + 0.25, w: 8.5, h: 0.4, fontFace: "Arial", fontSize: 18, color: FG, margin: 0 });
  });
}

// 5 Ask
{
  const s = pres.addSlide();
  bg(s);
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.18, h: 7.5, fill: { color: EMERALD } });
  s.addText("Why we win", {
    x: 0.7, y: 1.5, w: 12, h: 0.4,
    fontFace: "Arial", fontSize: 14, color: EMERALD, bold: true, charSpacing: 2,
  });
  s.addText("Innovation · Impact · Codex · Design", {
    x: 0.7, y: 2.1, w: 12, h: 0.7,
    fontFace: "Arial", fontSize: 32, bold: true, color: FG, margin: 0,
  });
  s.addText("Codex isn't a footnote — it's what chat is watching.\nBuilt for streamers. Fun for communities. Ready for the TwitchCon stage.", {
    x: 0.7, y: 3.1, w: 11, h: 1.4,
    fontFace: "Arial", fontSize: 20, color: MUTED, margin: 0,
  });
  s.addText("Chat Ships It  ·  Green Robin Labs", {
    x: 0.7, y: 5.5, w: 12, h: 0.4,
    fontFace: "Arial", fontSize: 16, color: FG, bold: true,
  });
}

pres.writeFile({ fileName: "deck/Chat-Ships-It-Pitch.pptx" }).then(() => {
  console.log("wrote deck/Chat-Ships-It-Pitch.pptx");
});
