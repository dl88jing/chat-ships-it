"use client";

import type {
  ChannelState,
  ChatMessage,
  FeatureRequest,
  PatchNote,
  WidgetBundle,
  BuildStep,
  DiffLine,
} from "./types";
import { materializeWidget, pickTemplate } from "./widgets";

const CHANNEL = "northbridge";
const LISTENERS = new Set<() => void>();

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

const seedChat: ChatMessage[] = [
  { id: "c1", user: "Avery", text: "first!", color: "#57F287", at: Date.now() - 20000, badges: ["mod"] },
  { id: "c2", user: "Morgan", text: "ready to ship something weird", color: "#EB459E", at: Date.now() - 15000 },
  { id: "c3", user: "River", text: "channel points loaded 👀", color: "#FEE75C", at: Date.now() - 10000 },
];

let state: ChannelState = {
  channel: CHANNEL,
  displayName: "Northbridge",
  queue: [
    {
      id: "req_seed_1",
      channel: CHANNEL,
      viewer: "Morgan",
      prompt: "add a rubber duck that quacks every time someone says LUL",
      createdAt: Date.now() - 60000,
      status: "queued",
    },
  ],
  widgets: [],
  patchNotes: [
    {
      id: "pn0",
      at: Date.now() - 120000,
      text: "Stream started — Chat Ships It online (DEMO_MODE)",
      viewer: "system",
    },
  ],
  chat: seedChat,
  buildingId: null,
  demoMode: true,
  connected: true,
};

function emit() {
  LISTENERS.forEach((l) => l());
}

export function getState() {
  return state;
}

export function subscribe(fn: () => void) {
  LISTENERS.add(fn);
  return () => LISTENERS.delete(fn);
}

export function setState( partial: Partial<ChannelState> ) {
  state = { ...state, ...partial };
  emit();
}

export function pushChat(user: string, text: string, color = "#9146FF") {
  const msg: ChatMessage = {
    id: uid("chat"),
    user,
    text,
    color,
    at: Date.now(),
  };
  state = { ...state, chat: [...state.chat.slice(-40), msg] };
  emit();
  // Broadcast into widget iframes via custom event
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("csi-bus", { detail: { type: "chat", user, text } }));
  }
  return msg;
}

export function pushCheer(user: string, bits: number) {
  pushChat(user, `Cheer${bits} Thanks for the stream!`, "#F59E0B");
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("csi-bus", { detail: { type: "cheer", user, bits } }));
  }
}

export function pushRaid(from: string, viewers: number) {
  pushChat("System", `${from} is raiding with ${viewers} viewers!`, "#22D3EE");
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("csi-bus", { detail: { type: "raid", from, viewers } }),
    );
  }
}

export function redeemFeature(viewer: string, prompt: string) {
  const req: FeatureRequest = {
    id: uid("req"),
    channel: state.channel,
    viewer,
    prompt,
    createdAt: Date.now(),
    status: "queued",
  };
  state = {
    ...state,
    queue: [...state.queue, req],
    patchNotes: [
      {
        id: uid("pn"),
        at: Date.now(),
        text: `@${viewer} redeemed Ship a Feature: “${prompt}”`,
        viewer,
      },
      ...state.patchNotes,
    ].slice(0, 30),
  };
  emit();
  pushChat(viewer, `redeemed Ship a Feature: ${prompt}`, "#9146FF");
  return req;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function approveAndBuild(requestId: string) {
  const req = state.queue.find((q) => q.id === requestId);
  if (!req) return;
  if (state.buildingId) return;

  const template = pickTemplate(req.prompt);
  const steps: BuildStep[] = template.plan.map((label, i) => ({
    id: `s${i}`,
    label,
    status: i === 0 ? "running" : "pending",
  }));
  const diff: DiffLine[] = [];

  state = {
    ...state,
    buildingId: requestId,
    queue: state.queue.map((q) =>
      q.id === requestId
        ? { ...q, status: "building", steps, diff, credit: req.viewer }
        : q,
    ),
    patchNotes: [
      {
        id: uid("pn"),
        at: Date.now(),
        text: `Codex started building “${template.name}” for @${req.viewer}`,
        viewer: "codex",
      },
      ...state.patchNotes,
    ],
  };
  emit();
  pushChat("CodexBot", `Building “${template.name}” for @${req.viewer}…`, "#10B981");

  // Stream plan steps + diff lines
  for (let i = 0; i < steps.length; i++) {
    await sleep(700 + Math.random() * 400);
    const nextSteps = steps.map((s, idx) => ({
      ...s,
      status:
        idx < i ? "done" : idx === i ? "running" : ("pending" as BuildStep["status"]),
      detail: idx === i ? "codex exec · sandbox workspace-write" : s.detail,
    }));
    steps.splice(0, steps.length, ...nextSteps);

    if (template.diff[i]) {
      diff.push(template.diff[i]);
    } else if (i === steps.length - 1) {
      template.diff.forEach((d) => {
        if (!diff.includes(d)) diff.push(d);
      });
    }

    state = {
      ...state,
      queue: state.queue.map((q) =>
        q.id === requestId
          ? {
              ...q,
              status: i >= steps.length - 2 ? "testing" : "building",
              steps: [...steps],
              diff: [...diff],
            }
          : q,
      ),
    };
    emit();
  }

  // Mark all done + test pass
  await sleep(500);
  const doneSteps = steps.map((s) => ({ ...s, status: "done" as const }));
  const widget = materializeWidget(template, req.viewer, req.prompt);
  const bundle: WidgetBundle = {
    id: widget.id,
    name: widget.name,
    credit: widget.credit,
    prompt: widget.prompt,
    html: widget.html,
    createdAt: Date.now(),
    active: true,
  };

  const note: PatchNote = {
    id: uid("pn"),
    at: Date.now(),
    text: `Shipped ${bundle.name} — Feature by @${req.viewer}`,
    viewer: req.viewer,
  };

  state = {
    ...state,
    buildingId: null,
    widgets: [...state.widgets.filter((w) => w.active), bundle],
    queue: state.queue.map((q) =>
      q.id === requestId
        ? {
            ...q,
            status: "shipped",
            steps: doneSteps,
            diff: template.diff,
            testPass: true,
            widgetId: bundle.id,
            credit: req.viewer,
          }
        : q,
    ),
    patchNotes: [note, ...state.patchNotes].slice(0, 30),
  };
  emit();
  pushChat("CodexBot", `✅ Shipped ${bundle.name} — Feature by @${req.viewer}`, "#10B981");
  return bundle;
}

export function revertWidget(widgetId: string) {
  const w = state.widgets.find((x) => x.id === widgetId);
  if (!w) return;
  state = {
    ...state,
    widgets: state.widgets.map((x) =>
      x.id === widgetId ? { ...x, active: false } : x,
    ),
    queue: state.queue.map((q) =>
      q.widgetId === widgetId ? { ...q, status: "reverted" } : q,
    ),
    patchNotes: [
      {
        id: uid("pn"),
        at: Date.now(),
        text: `Reverted ${w.name} (!revert)`,
        viewer: "mod",
      },
      ...state.patchNotes,
    ],
  };
  emit();
  pushChat("CodexBot", `Reverted ${w.name}`, "#F97316");
}

export async function remixTopTwo() {
  const active = state.widgets.filter((w) => w.active);
  if (active.length < 1) {
    // ship duck then confetti-ish remix prompt
    const r = redeemFeature("Avery", "remix rubber duck + raid confetti into a celebration duck");
    await approveAndBuild(r.id);
    return;
  }
  const r = redeemFeature(
    "Avery",
    `remix ${active.map((a) => a.name).join(" + ")} into a celebration widget`,
  );
  await approveAndBuild(r.id);
}

export function runDemoScript() {
  // Fire a canned sequence useful for screenshots / video capture
  void (async () => {
    pushChat("River", "LUL", "#FEE75C");
    await sleep(400);
    const existing = state.queue.find((q) => q.status === "queued");
    if (existing) await approveAndBuild(existing.id);
    await sleep(800);
    pushChat("Morgan", "LUL that duck is perfect", "#EB459E");
    await sleep(600);
    pushCheer("River", 100);
    await sleep(500);
    redeemFeature("Avery", "confetti burst whenever we get raided or cheered");
    await sleep(400);
    const next = state.queue.find((q) => q.status === "queued");
    if (next) await approveAndBuild(next.id);
    await sleep(600);
    pushRaid("Morgan", 42);
  })();
}
