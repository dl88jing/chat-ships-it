"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CodexBuildPanel } from "@/components/CodexBuildPanel";
import { QueuePanel } from "@/components/QueuePanel";
import { PatchNotes } from "@/components/PatchNotes";
import { WidgetHost } from "@/components/WidgetHost";
import { useChannel } from "@/components/useChannel";
import { approveAndBuild, pushChat, redeemFeature } from "@/lib/demo-store";
import { connectTwitchChat, type TwitchChatStatus } from "@/lib/twitch-chat-client";
import { parseVoteIntent } from "@/lib/twitch-irc";
import { maskProfanity } from "@/lib/profanity";
import type { ChatMessage } from "@/lib/types";

const OPTIONS = [
  { id: 1, viewer: "chat", prompt: "add a rubber duck that quacks every time someone says LUL" },
  { id: 2, viewer: "chat", prompt: "confetti burst whenever we get raided or cheered" },
  { id: 3, viewer: "chat", prompt: "sub goal thermometer that fills with hype" },
];

function statusLabel(s: TwitchChatStatus): string {
  switch (s) {
    case "joined":
      return "connected · reading chat";
    case "connected":
      return "connected · joining…";
    case "connecting":
      return "connecting…";
    case "error":
      return "error — retrying";
    case "closed":
      return "disconnected";
    default:
      return s;
  }
}

function LiveInner() {
  const params = useSearchParams();
  const channel = (params.get("channel") || "xqc").replace(/^#/, "").toLowerCase();
  const state = useChannel();
  const [status, setStatus] = useState<TwitchChatStatus>("idle");
  const [liveChat, setLiveChat] = useState<ChatMessage[]>([]);
  const [votes, setVotes] = useState<Record<number, number>>({ 1: 0, 2: 0, 3: 0 });
  const votersRef = useRef<Record<string, number>>({});
  const lastShipAt = useRef(0);
  const shipping = useRef(false);
  const votesRef = useRef(votes);
  votesRef.current = votes;

  const busy = Boolean(state.buildingId);
  const busyRef = useRef(busy);
  busyRef.current = busy;

  const building = useMemo(
    () =>
      state.queue.find((q) => q.id === state.buildingId) ??
      state.queue.find((q) => q.status === "building" || q.status === "testing") ??
      null,
    [state],
  );

  const shipWinner = useCallback(async (option: number) => {
    const now = Date.now();
    if (shipping.current) return;
    if (now - lastShipAt.current < 10000) return;
    if (busyRef.current) return;
    shipping.current = true;
    lastShipAt.current = now;
    try {
      const opt = OPTIONS.find((o) => o.id === option) ?? OPTIONS[0];
      const req = redeemFeature(opt.viewer, opt.prompt);
      pushChat(
        "CodexBot",
        `Chat voted #${option} — shipping “${opt.prompt.slice(0, 48)}…”`,
        "#10B981",
      );
      await approveAndBuild(req.id);
      setVotes({ 1: 0, 2: 0, 3: 0 });
      votersRef.current = {};
    } finally {
      shipping.current = false;
    }
  }, []);

  useEffect(() => {
    const conn = connectTwitchChat(channel, {
      onStatus: (s) => setStatus(s),
      onMessage: (msg) => {
        const id = `${msg.user}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const safeText = maskProfanity(msg.text);
        const chatMsg: ChatMessage = {
          id,
          user: msg.displayName || msg.user,
          text: safeText,
          color: msg.color || "#9146FF",
          at: Date.now(),
        };
        setLiveChat((prev) => [...prev.slice(-60), chatMsg]);
        // Feed existing chat-vote / widget bus (masked for overlay safety)
        pushChat(chatMsg.user, safeText, chatMsg.color);

        const intent = parseVoteIntent(msg.text);
        if (intent.kind === "vote") {
          const key = msg.user.toLowerCase();
          if (votersRef.current[key]) return;
          votersRef.current[key] = intent.option;
          setVotes((v) => {
            const next = { ...v, [intent.option]: (v[intent.option] || 0) + 1 };
            if ((next[intent.option] || 0) >= 5) {
              queueMicrotask(() => void shipWinner(intent.option));
            }
            return next;
          });
        } else if (intent.kind === "ship") {
          const entries = Object.entries(votesRef.current) as [string, number][];
          entries.sort((a, b) => b[1] - a[1]);
          const winner = Number(entries[0]?.[0] || 1);
          void shipWinner(winner);
        }
      },
    });
    return () => conn.close();
  }, [channel, shipWinner]);

  const leader = useMemo(() => {
    const entries = OPTIONS.map((o) => ({ ...o, count: votes[o.id] || 0 }));
    entries.sort((a, b) => b.count - a.count);
    return entries[0];
  }, [votes]);

  return (
    <div className="min-h-screen bg-[#050508] text-white">
      <header className="border-b border-white/10 px-4 py-3">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/" className="text-sm text-zinc-400 hover:text-white">
              ← Chat Ships It
            </Link>
            <div className="flex items-center gap-2 rounded-full bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wider">
              <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
              LIVE · twitch.tv/{channel}
            </div>
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                status === "joined"
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                  : "border-amber-500/30 bg-amber-500/10 text-amber-200"
              }`}
            >
              IRC {statusLabel(status)}
            </span>
          </div>
          <div className="text-[11px] text-zinc-500">
            Anonymous justinfan · no Twitch keys · OBS-ready browser source
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1400px] gap-4 p-4 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black shadow-2xl">
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 30%, rgba(145,70,255,.35), transparent 40%), radial-gradient(circle at 80% 70%, rgba(16,185,129,.2), transparent 35%)",
              }}
            />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="text-sm uppercase tracking-[0.3em] text-zinc-500">Overlay preview</div>
              <div className="mt-2 text-2xl font-black text-white/90">twitch.tv/{channel}</div>
              <div className="mt-1 text-sm text-zinc-400">Real chat in → chat votes → Codex ships</div>
            </div>
            <WidgetHost widgets={state.widgets} />
            <div className="absolute left-4 top-4 w-[340px]">
              <CodexBuildPanel request={building} />
            </div>
            <div className="absolute bottom-4 left-4 w-[380px]">
              <PatchNotes notes={state.patchNotes} />
            </div>
            <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-red-600/90 px-3 py-1 text-xs font-bold">
              <span className="h-2 w-2 animate-pulse rounded-full bg-white" /> LIVE
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-zinc-950/90 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold">Chat vote → what gets shipped</h3>
                <button
                  disabled={busy}
                  onClick={() => void shipWinner(leader.id)}
                  className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-black disabled:opacity-40"
                >
                  Ship leader (#{leader.id})
                </button>
              </div>
              <ul className="space-y-2">
                {OPTIONS.map((o) => (
                  <li
                    key={o.id}
                    className={`rounded-xl border px-3 py-2 text-sm ${
                      leader.id === o.id ? "border-emerald-500/40 bg-emerald-500/10" : "border-white/5"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-violet-300">#{o.id}</span>
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs tabular-nums">
                        {votes[o.id] || 0} votes
                      </span>
                    </div>
                    <div className="mt-1 text-zinc-400">{o.prompt}</div>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[11px] leading-relaxed text-zinc-500">
                Viewers type <code className="text-emerald-300">1</code> /{" "}
                <code className="text-emerald-300">2</code> / <code className="text-emerald-300">3</code> or{" "}
                <code className="text-emerald-300">!vote N</code>.{" "}
                <code className="text-emerald-300">!ship</code> ships the leader. Auto-ships at 5 votes.
                Widget build uses curated Codex templates unless <code>OPENAI_API_KEY</code> is set
                (simulated execution path labeled honestly).
              </p>
            </div>
            <QueuePanel
              queue={state.queue}
              busy={busy}
              onShip={(id) => void approveAndBuild(id)}
            />
          </div>
        </div>

        <aside className="flex flex-col gap-4">
          <div className="flex h-[640px] flex-col rounded-2xl border border-white/10 bg-zinc-950/90 backdrop-blur">
            <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
                Real Twitch chat · #{channel}
              </div>
              <div className="text-[10px] text-zinc-500">{liveChat.length} lines</div>
            </div>
            <div className="flex-1 space-y-1.5 overflow-y-auto p-3">
              {liveChat.length === 0 && (
                <div className="text-sm text-zinc-500">
                  Waiting for PRIVMSG from irc-ws.chat.twitch.tv…
                </div>
              )}
              {liveChat.map((m) => (
                <div key={m.id} className="text-sm leading-snug">
                  <span className="font-semibold" style={{ color: m.color }}>
                    {m.user}
                  </span>
                  <span className="text-zinc-500">: </span>
                  <span className="text-zinc-200">{m.text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs leading-relaxed text-zinc-400">
            <strong className="text-amber-200">Honesty labels:</strong> Chat ingest is{" "}
            <em className="text-zinc-200">real</em> anonymous Twitch IRC (no secrets). Codex overlay UX
            is live; HTML generation without <code className="text-emerald-300">OPENAI_API_KEY</code>{" "}
            uses curated templates (DEMO_MODE build path). Channel-point EventSub still needs a Twitch
            app for production — see docs/WORKER.md.
          </div>
        </aside>
      </main>
    </div>
  );
}

export default function LivePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#050508] text-zinc-400">
          Loading live chat…
        </div>
      }
    >
      <LiveInner />
    </Suspense>
  );
}
